import z from "zod";
import { zodValidationPipeFactory } from "@Package/api";

const schema = z.object({
    access_token: z.string()
        .min(1, 'Access token is required')
        .max(2048, 'Access token is too long')
        .regex(/^[A-Za-z0-9._-]+$/, 'Invalid access token format'),
    otp: z.string()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d{6}$/, 'OTP must contain only numbers')
        .trim(),
});

export type VerifyOtpDto = z.infer<typeof schema>;
export const verifyOtpDtoValidation = zodValidationPipeFactory(schema);