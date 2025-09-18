import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as handlebars from 'handlebars';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
  category: EmailCategory;
  priority: EmailPriority;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum EmailCategory {
  AUTHENTICATION = 'authentication',
  SECURITY = 'security',
  NOTIFICATION = 'notification',
  MARKETING = 'marketing',
  SYSTEM = 'system'
}

export enum EmailPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
  CRITICAL = 5
}

export interface EmailTemplateData {
  // User data
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  
  // Authentication data
  otp?: string;
  inviteCode?: string;
  resetToken?: string;
  
  // Company data
  companyName?: string;
  companyLogo?: string;
  supportEmail?: string;
  websiteUrl?: string;
  
  // Security data
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
  timestamp?: string;
  
  // Custom data
  [key: string]: any;
}

export interface CompiledEmailTemplate {
  subject: string;
  html: string;
  text: string;
  priority: EmailPriority;
}

@Injectable()
export class EmailTemplateService {
  private readonly templatesPath = path.join(process.cwd(), 'templates', 'email');
  private readonly templateCache = new Map<string, EmailTemplate>();
  private readonly compiledCache = new Map<string, handlebars.TemplateDelegate>();

  constructor() {
    this.initializeHandlebarsHelpers();
    // Don't await in constructor, but start the initialization
    this.initializeTemplates().catch(error => {
      console.error('Failed to initialize email templates in constructor:', error);
    });
  }

  private async initializeTemplates(): Promise<void> {
    try {
      console.log('[EMAIL_TEMPLATE_SERVICE] Starting template initialization...');
      console.log('[EMAIL_TEMPLATE_SERVICE] Templates path:', this.templatesPath);

      // Ensure templates directory exists
      await fs.mkdir(this.templatesPath, { recursive: true });
      console.log('[EMAIL_TEMPLATE_SERVICE] Templates directory created/verified');

      // Check if templates exist, if not create default ones
      const files = await fs.readdir(this.templatesPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      console.log('[EMAIL_TEMPLATE_SERVICE] Found template files:', jsonFiles);

      if (jsonFiles.length === 0) {
        console.log('[EMAIL_TEMPLATE_SERVICE] No email templates found, creating default templates...');
        await this.createDefaultTemplates();
        console.log('[EMAIL_TEMPLATE_SERVICE] Default templates created successfully');
      } else {
        console.log('[EMAIL_TEMPLATE_SERVICE] Templates already exist, skipping creation');
      }
    } catch (error) {
      console.error('[EMAIL_TEMPLATE_SERVICE] Failed to initialize email templates:', error);
      console.error('[EMAIL_TEMPLATE_SERVICE] Error stack:', error.stack);
    }
  }

  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    // Check cache first
    if (this.templateCache.has(templateId)) {
      return this.templateCache.get(templateId)!;
    }

    // Load from file system
    try {
      const template = await this.loadTemplateFromFile(templateId);
      if (template) {
        this.templateCache.set(templateId, template);
      }
      return template;
    } catch (error) {
      console.error(`Failed to load template ${templateId}:`, error);
      return null;
    }
  }

  async compileTemplate(templateId: string, data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    console.log(`[EMAIL_TEMPLATE_SERVICE] compileTemplate called for: ${templateId}`);
    console.log(`[EMAIL_TEMPLATE_SERVICE] Template data:`, data);

    const template = await this.getTemplate(templateId);
    if (!template) {
      console.error(`[EMAIL_TEMPLATE_SERVICE] Template not found: ${templateId}`);
      return null;
    }

    console.log(`[EMAIL_TEMPLATE_SERVICE] Template found:`, {
      id: template.id,
      name: template.name,
      hasSubject: !!template.subject,
      hasHtmlTemplate: !!template.htmlTemplate,
      hasTextTemplate: !!template.textTemplate,
      htmlTemplateLength: template.htmlTemplate?.length || 0,
      subjectTemplate: template.subject
    });

    try {
      // Compile subject
      const subjectTemplate = handlebars.compile(template.subject);
      const subject = subjectTemplate(data);
      console.log(`[EMAIL_TEMPLATE_SERVICE] Compiled subject: "${subject}"`);

      // Compile HTML
      let htmlCompiled: handlebars.TemplateDelegate;
      const htmlCacheKey = `${templateId}_html`;

      if (this.compiledCache.has(htmlCacheKey)) {
        htmlCompiled = this.compiledCache.get(htmlCacheKey)!;
        console.log(`[EMAIL_TEMPLATE_SERVICE] Using cached HTML template`);
      } else {
        console.log(`[EMAIL_TEMPLATE_SERVICE] Compiling HTML template, length: ${template.htmlTemplate.length}`);
        htmlCompiled = handlebars.compile(template.htmlTemplate);
        this.compiledCache.set(htmlCacheKey, htmlCompiled);
        console.log(`[EMAIL_TEMPLATE_SERVICE] HTML template compiled and cached`);
      }

      const html = htmlCompiled(data);
      console.log(`[EMAIL_TEMPLATE_SERVICE] Compiled HTML length: ${html.length}`);
      console.log(`[EMAIL_TEMPLATE_SERVICE] HTML preview: ${html.substring(0, 200)}...`);

      // Compile text
      let textCompiled: handlebars.TemplateDelegate;
      const textCacheKey = `${templateId}_text`;

      if (this.compiledCache.has(textCacheKey)) {
        textCompiled = this.compiledCache.get(textCacheKey)!;
      } else {
        textCompiled = handlebars.compile(template.textTemplate);
        this.compiledCache.set(textCacheKey, textCompiled);
      }

      const text = textCompiled(data);
      console.log(`[EMAIL_TEMPLATE_SERVICE] Compiled text length: ${text.length}`);

      const result = {
        subject,
        html,
        text,
        priority: template.priority
      };

      console.log(`[EMAIL_TEMPLATE_SERVICE] Template compilation successful for ${templateId}`);
      return result;
    } catch (error) {
      console.error(`[EMAIL_TEMPLATE_SERVICE] Failed to compile template ${templateId}:`, error);
      console.error(`[EMAIL_TEMPLATE_SERVICE] Error stack:`, error.stack);
      return null;
    }
  }

  async getOTPEmailTemplate(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    console.log('[EMAIL_TEMPLATE_SERVICE] getOTPEmailTemplate called with data:', data);

    // Ensure templates are initialized
    await this.ensureTemplatesInitialized();

    const templateData = {
      ...data,
      companyName: process.env.COMPANY_NAME || 'Empty Space',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@emptyspace.com',
      websiteUrl: process.env.WEBSITE_URL || 'https://emptyspace.com'
    };

    console.log('[EMAIL_TEMPLATE_SERVICE] Template data prepared:', templateData);

    const compiled = await this.compileTemplate('otp-verification', templateData);

    console.log('[EMAIL_TEMPLATE_SERVICE] Template compilation result:', {
      hasCompiled: !!compiled,
      hasHtml: !!compiled?.html,
      hasSubject: !!compiled?.subject
    });

    // If template compilation fails, provide a fallback
    if (!compiled && data.otp) {
      console.warn('[EMAIL_TEMPLATE_SERVICE] OTP template compilation failed, using fallback template');
      return {
        subject: `Your verification code for ${templateData.companyName}`,
        html: this.getFallbackOTPHtml(data.otp, templateData),
        text: this.getFallbackOTPText(data.otp, templateData),
        priority: EmailPriority.HIGH
      };
    }

    return compiled;
  }

  private async ensureTemplatesInitialized(): Promise<void> {
    try {
      // Check if templates directory exists and has templates
      const files = await fs.readdir(this.templatesPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      if (jsonFiles.length === 0) {
        console.log('[EMAIL_TEMPLATE_SERVICE] Templates not found during ensure, creating now...');
        await this.initializeTemplates();
      }
    } catch (error) {
      console.log('[EMAIL_TEMPLATE_SERVICE] Templates directory does not exist, creating...');
      await this.initializeTemplates();
    }
  }

  private getFallbackOTPHtml(otp: string, data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Your Verification Code</h2>
        <p>Hello ${data.firstName || 'User'},</p>
        <p>Your verification code for ${data.companyName} is:</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `;
  }

  private getFallbackOTPText(otp: string, data: any): string {
    return `
Hello ${data.firstName || 'User'},

Your verification code for ${data.companyName} is: ${otp}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
${data.companyName} Team
    `;
  }

  async getWelcomeEmailTemplate(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    return this.compileTemplate('welcome', {
      ...data,
      companyName: process.env.COMPANY_NAME || 'Empty Space',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@emptyspace.com',
      websiteUrl: process.env.WEBSITE_URL || 'https://emptyspace.com'
    });
  }

  async getPasswordResetEmailTemplate(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    return this.compileTemplate('password-reset', {
      ...data,
      companyName: process.env.COMPANY_NAME || 'Empty Space',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@emptyspace.com',
      websiteUrl: process.env.WEBSITE_URL || 'https://emptyspace.com'
    });
  }

  async getSecurityAlertEmailTemplate(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    return this.compileTemplate('security-alert', {
      ...data,
      companyName: process.env.COMPANY_NAME || 'Empty Space',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@emptyspace.com',
      websiteUrl: process.env.WEBSITE_URL || 'https://emptyspace.com',
      timestamp: new Date().toLocaleString()
    });
  }

  async getAccountLockedEmailTemplate(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    return this.compileTemplate('account-locked', {
      ...data,
      companyName: process.env.COMPANY_NAME || 'Empty Space',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@emptyspace.com',
      websiteUrl: process.env.WEBSITE_URL || 'https://emptyspace.com',
      timestamp: new Date().toLocaleString()
    });
  }

  async getInviteEmailTemplate(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    return this.compileTemplate('employee-invite', {
      ...data,
      companyName: process.env.COMPANY_NAME || 'Empty Space',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@emptyspace.com',
      websiteUrl: process.env.WEBSITE_URL || 'https://emptyspace.com'
    });
  }

  async createDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        id: 'otp-verification',
        name: 'OTP Verification',
        subject: 'Your verification code for {{companyName}}',
        category: EmailCategory.AUTHENTICATION,
        priority: EmailPriority.HIGH,
        htmlTemplate: this.getOTPHtmlTemplate(),
        textTemplate: this.getOTPTextTemplate(),
        variables: ['firstName', 'otp', 'companyName', 'supportEmail']
      },
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to {{companyName}}, {{firstName}}!',
        category: EmailCategory.AUTHENTICATION,
        priority: EmailPriority.NORMAL,
        htmlTemplate: this.getWelcomeHtmlTemplate(),
        textTemplate: this.getWelcomeTextTemplate(),
        variables: ['firstName', 'lastName', 'companyName', 'websiteUrl', 'supportEmail']
      },
      {
        id: 'password-reset',
        name: 'Password Reset',
        subject: 'Reset your {{companyName}} password',
        category: EmailCategory.SECURITY,
        priority: EmailPriority.HIGH,
        htmlTemplate: this.getPasswordResetHtmlTemplate(),
        textTemplate: this.getPasswordResetTextTemplate(),
        variables: ['firstName', 'resetToken', 'companyName', 'websiteUrl', 'supportEmail']
      },
      {
        id: 'security-alert',
        name: 'Security Alert',
        subject: 'Security Alert - {{companyName}}',
        category: EmailCategory.SECURITY,
        priority: EmailPriority.URGENT,
        htmlTemplate: this.getSecurityAlertHtmlTemplate(),
        textTemplate: this.getSecurityAlertTextTemplate(),
        variables: ['firstName', 'ipAddress', 'location', 'deviceInfo', 'timestamp', 'companyName', 'supportEmail']
      },
      {
        id: 'account-locked',
        name: 'Account Locked',
        subject: 'Your {{companyName}} account has been locked',
        category: EmailCategory.SECURITY,
        priority: EmailPriority.CRITICAL,
        htmlTemplate: this.getAccountLockedHtmlTemplate(),
        textTemplate: this.getAccountLockedTextTemplate(),
        variables: ['firstName', 'timestamp', 'companyName', 'supportEmail']
      },
      {
        id: 'employee-invite',
        name: 'Employee Invitation',
        subject: 'You\'re invited to join {{companyName}}',
        category: EmailCategory.AUTHENTICATION,
        priority: EmailPriority.HIGH,
        htmlTemplate: this.getInviteHtmlTemplate(),
        textTemplate: this.getInviteTextTemplate(),
        variables: ['firstName', 'inviteCode', 'companyName', 'websiteUrl', 'supportEmail']
      }
    ];

    for (const templateData of defaultTemplates) {
      await this.saveTemplateToFile(templateData);
    }
  }

  private async loadTemplateFromFile(templateId: string): Promise<EmailTemplate | null> {
    try {
      const filePath = path.join(this.templatesPath, `${templateId}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const templateData = JSON.parse(fileContent);
      
      return {
        ...templateData,
        createdAt: new Date(templateData.createdAt),
        updatedAt: new Date(templateData.updatedAt)
      };
    } catch (error) {
      return null;
    }
  }

  private async saveTemplateToFile(templateData: any): Promise<void> {
    try {
      // Ensure templates directory exists
      await fs.mkdir(this.templatesPath, { recursive: true });
      
      const template: EmailTemplate = {
        ...templateData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const filePath = path.join(this.templatesPath, `${template.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(template, null, 2));
    } catch (error) {
      console.error(`Failed to save template ${templateData.id}:`, error);
    }
  }

  private initializeHandlebarsHelpers(): void {
    // Date formatting helper
    handlebars.registerHelper('formatDate', (date: Date, format: string) => {
      if (!date) return '';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    });

    // Uppercase helper
    handlebars.registerHelper('uppercase', (str: string) => {
      return str ? str.toUpperCase() : '';
    });

    // Conditional helper
    handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
  }

  private getOTPHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: #2c3e50; margin-bottom: 30px;">Verification Code</h1>
        
        <p style="font-size: 16px; margin-bottom: 30px;">
            Hello {{firstName}},<br>
            Your verification code for {{companyName}} is:
        </p>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 30px 0; border: 2px solid #3498db;">
            <h2 style="font-size: 32px; letter-spacing: 8px; margin: 0; color: #2c3e50;">{{otp}}</h2>
        </div>
        
        <p style="font-size: 14px; color: #7f8c8d; margin-bottom: 20px;">
            This code will expire in 10 minutes for security reasons.
        </p>
        
        <p style="font-size: 14px; color: #7f8c8d;">
            If you didn't request this code, please ignore this email or contact our support team at {{supportEmail}}.
        </p>
    </div>
</body>
</html>`;
  }

  private getOTPTextTemplate(): string {
    return `
Hello {{firstName}},

Your verification code for {{companyName}} is: {{otp}}

This code will expire in 10 minutes for security reasons.

If you didn't request this code, please ignore this email or contact our support team at {{supportEmail}}.

Best regards,
{{companyName}} Team
`;
  }

  private getWelcomeHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{companyName}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Welcome to {{companyName}}!</h1>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Hello {{firstName}} {{lastName}},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Welcome to {{companyName}}! We're excited to have you as part of our team.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 30px;">
            Your account has been successfully created and you can now access all the features available to you.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{websiteUrl}}" style="background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Get Started
            </a>
        </div>
        
        <p style="font-size: 14px; color: #7f8c8d; text-align: center;">
            If you have any questions, feel free to contact us at {{supportEmail}}.
        </p>
    </div>
</body>
</html>`;
  }

  private getWelcomeTextTemplate(): string {
    return `
Hello {{firstName}} {{lastName}},

Welcome to {{companyName}}! We're excited to have you as part of our team.

Your account has been successfully created and you can now access all the features available to you.

Visit {{websiteUrl}} to get started.

If you have any questions, feel free to contact us at {{supportEmail}}.

Best regards,
{{companyName}} Team
`;
  }

  private getPasswordResetHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Password Reset Request</h1>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Hello {{firstName}},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            We received a request to reset your password for your {{companyName}} account.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{websiteUrl}}/reset-password?token={{resetToken}}" style="background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
            </a>
        </div>
        
        <p style="font-size: 14px; color: #7f8c8d; margin-bottom: 20px;">
            This link will expire in 1 hour for security reasons.
        </p>
        
        <p style="font-size: 14px; color: #7f8c8d;">
            If you didn't request this password reset, please ignore this email or contact our support team at {{supportEmail}}.
        </p>
    </div>
</body>
</html>`;
  }

  private getPasswordResetTextTemplate(): string {
    return `
Hello {{firstName}},

We received a request to reset your password for your {{companyName}} account.

Click the following link to reset your password:
{{websiteUrl}}/reset-password?token={{resetToken}}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email or contact our support team at {{supportEmail}}.

Best regards,
{{companyName}} Team
`;
  }

  private getSecurityAlertHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 30px; border-radius: 10px;">
        <h1 style="color: #856404; text-align: center; margin-bottom: 30px;">🔒 Security Alert</h1>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Hello {{firstName}},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            We detected unusual activity on your {{companyName}} account.
        </p>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f39c12;">
            <h3 style="margin-top: 0; color: #856404;">Activity Details:</h3>
            <p><strong>IP Address:</strong> {{ipAddress}}</p>
            <p><strong>Location:</strong> {{location}}</p>
            <p><strong>Device:</strong> {{deviceInfo}}</p>
            <p><strong>Time:</strong> {{timestamp}}</p>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately.
        </p>
        
        <p style="font-size: 14px; color: #7f8c8d;">
            For assistance, contact our support team at {{supportEmail}}.
        </p>
    </div>
</body>
</html>`;
  }

  private getSecurityAlertTextTemplate(): string {
    return `
Hello {{firstName}},

We detected unusual activity on your {{companyName}} account.

Activity Details:
- IP Address: {{ipAddress}}
- Location: {{location}}
- Device: {{deviceInfo}}
- Time: {{timestamp}}

If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately.

For assistance, contact our support team at {{supportEmail}}.

Best regards,
{{companyName}} Security Team
`;
  }

  private getAccountLockedHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Locked</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 30px; border-radius: 10px;">
        <h1 style="color: #721c24; text-align: center; margin-bottom: 30px;">🔒 Account Locked</h1>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Hello {{firstName}},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Your {{companyName}} account has been temporarily locked due to multiple failed login attempts.
        </p>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <p><strong>Locked at:</strong> {{timestamp}}</p>
            <p><strong>Reason:</strong> Multiple failed login attempts detected</p>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            For security reasons, your account will be automatically unlocked after a waiting period. If you believe this was an error or need immediate assistance, please contact our support team.
        </p>
        
        <p style="font-size: 14px; color: #7f8c8d;">
            Contact support: {{supportEmail}}
        </p>
    </div>
</body>
</html>`;
  }

  private getAccountLockedTextTemplate(): string {
    return `
Hello {{firstName}},

Your {{companyName}} account has been temporarily locked due to multiple failed login attempts.

Locked at: {{timestamp}}
Reason: Multiple failed login attempts detected

For security reasons, your account will be automatically unlocked after a waiting period. If you believe this was an error or need immediate assistance, please contact our support team.

Contact support: {{supportEmail}}

Best regards,
{{companyName}} Security Team
`;
  }

  private getInviteHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">You're Invited to Join {{companyName}}!</h1>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Hello {{firstName}},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            You've been invited to join {{companyName}} as a team member. We're excited to have you on board!
        </p>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 30px 0; border: 2px solid #27ae60; text-align: center;">
            <h3 style="margin-top: 0; color: #27ae60;">Your Invite Code:</h3>
            <h2 style="font-size: 24px; letter-spacing: 2px; margin: 10px 0; color: #2c3e50;">{{inviteCode}}</h2>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{websiteUrl}}/register?invite={{inviteCode}}" style="background: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Accept Invitation
            </a>
        </div>
        
        <p style="font-size: 14px; color: #7f8c8d; text-align: center;">
            If you have any questions, feel free to contact us at {{supportEmail}}.
        </p>
    </div>
</body>
</html>`;
  }

  private getInviteTextTemplate(): string {
    return `
Hello {{firstName}},

You've been invited to join {{companyName}} as a team member. We're excited to have you on board!

Your invite code: {{inviteCode}}

To accept this invitation, visit: {{websiteUrl}}/register?invite={{inviteCode}}

If you have any questions, feel free to contact us at {{supportEmail}}.

Best regards,
{{companyName}} Team
`;
  }

  // Convenience methods for authentication flows
  async generateRegistrationOTP(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    return this.compileTemplate('registration-otp', data);
  }

  async generatePasswordResetOTP(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    return this.compileTemplate('password-reset-otp', data);
  }

  async generateWelcomeEmail(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    return this.compileTemplate('welcome', data);
  }

  async generatePasswordChangeNotification(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    return this.compileTemplate('password-changed', data);
  }

  async generateSecurityAlert(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    return this.compileTemplate('security-alert', data);
  }

  async generateAccountLocked(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    return this.compileTemplate('account-locked', data);
  }

  async generateInviteEmail(data: EmailTemplateData): Promise<CompiledEmailTemplate | null> {
    return this.compileTemplate('invite', data);
  }

  // Multi-language support
  async generateTemplateWithLanguage(
    templateId: string,
    data: EmailTemplateData,
    language: string = 'en'
  ): Promise<CompiledEmailTemplate | null> {
    const localizedTemplateId = `${templateId}-${language}`;

    // Try localized version first
    let template = await this.compileTemplate(localizedTemplateId, data);

    // Fallback to default language if localized version doesn't exist
    if (!template && language !== 'en') {
      template = await this.compileTemplate(templateId, data);
    }

    return template;
  }

  // Batch template compilation for performance
  async precompileTemplates(templateIds: string[]): Promise<void> {
    const promises = templateIds.map(async (templateId) => {
      try {
        const template = await this.getTemplate(templateId);
        if (template) {
          // Pre-compile subject, html, and text templates
          this.compiledCache.set(`${templateId}_subject`, handlebars.compile(template.subject));
          this.compiledCache.set(`${templateId}_html`, handlebars.compile(template.htmlTemplate));
          this.compiledCache.set(`${templateId}_text`, handlebars.compile(template.textTemplate));
        }
      } catch (error) {
        console.error(`Failed to precompile template ${templateId}:`, error);
      }
    });

    await Promise.all(promises);
  }

  // Template validation
  validateTemplateData(templateId: string, data: EmailTemplateData): { isValid: boolean; missingVariables: string[] } {
    const template = this.templateCache.get(templateId);
    if (!template) {
      return { isValid: false, missingVariables: [] };
    }

    const missingVariables = template.variables.filter(variable =>
      data[variable] === undefined || data[variable] === null
    );

    return {
      isValid: missingVariables.length === 0,
      missingVariables
    };
  }

  // Clear template cache
  clearCache(): void {
    this.templateCache.clear();
    this.compiledCache.clear();
  }

  // Get all available templates
  async getAllTemplates(): Promise<EmailTemplate[]> {
    try {
      const files = await fs.readdir(this.templatesPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      const templates = await Promise.all(
        jsonFiles.map(file => this.loadTemplateFromFile(path.basename(file, '.json')))
      );

      return templates.filter(template => template !== null) as EmailTemplate[];
    } catch (error) {
      console.error('Failed to load all templates:', error);
      return [];
    }
  }
}
