# OTP Email Fix Summary

**Issue:** OTP emails were being sent empty with no verification code during registration confirmation.

## Root Cause Analysis

The problem was caused by multiple issues in the email template system:

1. **Incorrect Templates Path:** The EmailTemplateService was looking for templates in `src/templates/email` instead of `templates/email`
2. **Missing Template Initialization:** Templates were not being created on service startup
3. **No Fallback Mechanism:** When template compilation failed, emails were sent empty
4. **Insufficient Error Handling:** Template failures were not properly logged or handled

## Fixes Implemented

### 1. Fixed Templates Path
**File:** `server/src/package/auth/services/email-template.service.ts`
**Lines:** 73

```typescript
// BEFORE
private readonly templatesPath = path.join(process.cwd(), 'src', 'templates', 'email');

// AFTER  
private readonly templatesPath = path.join(process.cwd(), 'templates', 'email');
```

### 2. Added Template Initialization
**File:** `server/src/package/auth/services/email-template.service.ts`
**Lines:** 77-98

```typescript
constructor() {
  this.initializeHandlebarsHelpers();
  this.initializeTemplates(); // NEW: Initialize templates on startup
}

private async initializeTemplates(): Promise<void> {
  try {
    // Ensure templates directory exists
    await fs.mkdir(this.templatesPath, { recursive: true });
    
    // Check if templates exist, if not create default ones
    const files = await fs.readdir(this.templatesPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('No email templates found, creating default templates...');
      await this.createDefaultTemplates();
    }
  } catch (error) {
    console.error('Failed to initialize email templates:', error);
  }
}
```

### 3. Added Fallback Template System
**File:** `server/src/package/auth/services/email-template.service.ts`
**Lines:** 168-220

```typescript
async getOTPEmailTemplate(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
  const templateData = {
    ...data,
    companyName: process.env.COMPANY_NAME || 'Empty Space',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@emptyspace.com',
    websiteUrl: process.env.WEBSITE_URL || 'https://emptyspace.com'
  };

  const compiled = await this.compileTemplate('otp-verification', templateData);
  
  // NEW: If template compilation fails, provide a fallback
  if (!compiled && data.otp) {
    console.warn('OTP template compilation failed, using fallback template');
    return {
      subject: `Your verification code for ${templateData.companyName}`,
      html: this.getFallbackOTPHtml(data.otp, templateData),
      text: this.getFallbackOTPText(data.otp, templateData),
      priority: EmailPriority.HIGH
    };
  }
  
  return compiled;
}
```

### 4. Enhanced Email Service Error Handling
**File:** `server/src/package/services/email/services/email.service.ts`
**Lines:** 51-71

```typescript
async sendSingInOTP(to: string, otp?: string) {
  let userOtp = otp
  if (!otp) {
    userOtp = generateOTP()
  }
  
  console.log(`[EMAIL_SERVICE] Sending OTP email to: ${to}, OTP: ${userOtp}`);
  
  const template = await this.emailTemplateService.getOTPEmailTemplate({ otp: userOtp });
  
  // NEW: Validate template before sending
  if (!template || !template.html) {
    console.error('[EMAIL_SERVICE] Failed to get OTP template, email will be empty');
    throw new AppError({
      code: ErrorCode.MAIL_ERROR,
      message: 'Failed to generate email template'
    });
  }
  
  console.log(`[EMAIL_SERVICE] Template generated successfully, sending email...`);
  return await this.sendMail(to, template.subject || "OTP for verification", template.html);
}
```

### 5. Improved Email Worker Debugging
**File:** `server/src/package/services/email/services/email.worker.ts`
**Lines:** 15-31

```typescript
async process(job: Job): Promise<any> {
  console.log("[EMAIL_WORKER] Processing email job:", {
    email: job.data.email,
    otp: job.data.otp,
    type: job.data.type,
    firstName: job.data.firstName,
    lastName: job.data.lastName
  });
  
  try {
    await this.mailService.sendSingInOTP(job.data.email, job.data.otp);
    console.log("[EMAIL_WORKER] Email sent successfully");
  } catch (error) {
    console.error("[EMAIL_WORKER] Failed to send email:", error);
    throw error;
  }
}
```

## Additional Fixes

### Fixed Missing Schema
**File:** `server/seeders/src/schemas/localFile.schema.ts` (NEW FILE)

Created missing LocalFile schema that was causing build errors.

### Fixed Email Service Method Calls
**File:** `server/src/package/services/email/services/email.service.ts`

Updated method calls to use correct EmailTemplateService methods:
- `getSigninTemplate()` → `getOTPEmailTemplate()`
- `getPasswordResetTemplate()` → `getPasswordResetEmailTemplate()`

### Removed Missing Import
**File:** `server/src/package/services/email/services/index.ts`

Removed import for non-existent `template.service` file.

## Testing

1. **Docker Build:** ✅ Successfully builds without errors
2. **Template Initialization:** ✅ Templates are created on service startup
3. **Fallback System:** ✅ Provides backup HTML when templates fail
4. **Error Handling:** ✅ Proper error logging and handling
5. **OTP Generation:** ✅ OTP codes are properly generated and passed

## Expected Results

- ✅ OTP emails will now contain the verification code
- ✅ Emails will have proper HTML formatting
- ✅ Fallback templates ensure emails are never empty
- ✅ Better error logging for debugging
- ✅ Automatic template creation on first run

## Deployment

The fixes have been implemented and the Docker image has been rebuilt successfully. The system is ready for deployment with working OTP email functionality.

**Status:** ✅ **RESOLVED** - OTP emails will now contain verification codes and proper formatting.
