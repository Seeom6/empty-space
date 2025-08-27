import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EnvironmentService } from "@Infrastructure/config";
import { AppError } from "@Package/error";
import { generateOTP } from '@Package/utilities';
import { EmailTemplateService } from './template.service';
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
        const html = await this.emailTemplateService.getSigninTemplate(userOtp);
        return await this.sendMail(to, "OTP for verification", html);
    }

    async sendPasswordResetEmail(to: string, otp: string) {
        const html = await this.emailTemplateService.getPasswordResetTemplate(otp);
        return await this.sendMail(to, "Reset Your Password", html);
    }
}
