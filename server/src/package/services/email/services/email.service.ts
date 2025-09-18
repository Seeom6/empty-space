import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EnvironmentService } from "@Infrastructure/config";
import { AppError } from "@Package/error";
import { generateOTP } from '@Package/utilities';
import { EmailTemplateService } from '@Package/auth/services/email-template.service';
import { ErrorCode } from '@Common/error';

@Injectable()
export class MailService {
    private readonly emailTemplateService: EmailTemplateService = new EmailTemplateService();
    private transporter: nodemailer.Transporter;
    constructor(private readonly env: EnvironmentService) {
        const host = this.env.get("mail.host")
        const port = this.env.get("mail.port")
        const user = this.env.get("mail.user") 
        const pass = this.env.get("mail.password")
        this.transporter = nodemailer.createTransport({
            host: host,
            port: Number(port),
            secure: false,
            auth: {
                user: user,
                pass: pass,
            },
            connectionTimeout: 30_000,
            socketTimeout: 30_000,
            greetingTimeout: 10_000,
        });
    }

    async sendMail(to: string, subject: string, html: string) {
        try {
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
                to,
                subject,
                html,
            };

            return await this.transporter.sendMail(mailOptions);
        } catch (e) {
            console.log("error in send email", e)
            throw new AppError({
                code: ErrorCode.MAIL_ERROR,
                message: `error in send email : ${e.message}`
            })
        }
    }

    async sendSingInOTP(to: string, otp?: string) {
        let userOtp = otp
        if (!otp) {
            userOtp = generateOTP()
        }

        console.log(`[EMAIL_SERVICE] Sending OTP email to: ${to}, OTP: ${userOtp}`);
        console.log(`[EMAIL_SERVICE] About to call getOTPEmailTemplate with data:`, { otp: userOtp });

        try {
            const template = await this.emailTemplateService.getOTPEmailTemplate({
                otp: userOtp,
                firstName: 'User' // Default fallback
            });

            console.log(`[EMAIL_SERVICE] Template result:`, {
                hasTemplate: !!template,
                hasHtml: !!template?.html,
                hasSubject: !!template?.subject,
                htmlLength: template?.html?.length || 0,
                subject: template?.subject
            });

            if (!template || !template.html) {
                console.error('[EMAIL_SERVICE] Failed to get OTP template, email will be empty');
                console.error('[EMAIL_SERVICE] Template object:', template);
                throw new AppError({
                    code: ErrorCode.MAIL_ERROR,
                    message: 'Failed to generate email template'
                });
            }

            console.log(`[EMAIL_SERVICE] Template generated successfully, HTML preview:`, template.html.substring(0, 200) + '...');
            console.log(`[EMAIL_SERVICE] About to send email with subject: "${template.subject}"`);

            const result = await this.sendMail(to, template.subject || "OTP for verification", template.html);
            console.log(`[EMAIL_SERVICE] Email sent successfully, result:`, result);
            return result;
        } catch (error) {
            console.error(`[EMAIL_SERVICE] Error in sendSingInOTP:`, error);
            throw error;
        }
    }

    async sendPasswordResetEmail(to: string, otp: string) {
        const html = await this.emailTemplateService.getPasswordResetEmailTemplate({ otp });
        return await this.sendMail(to, "Reset Your Password", html?.html || '');
    }
}
