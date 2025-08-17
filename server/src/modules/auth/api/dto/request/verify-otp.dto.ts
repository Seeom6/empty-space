import z from "zod";
import { zodValidationPipeFactory } from "@Package/api";

const schema = z.object({
    access_token: z.string(),
    otp: z.string(),
});

export type VerifyOtpDto = z.infer<typeof schema>;
export const verifyOtpDtoValidation = zodValidationPipeFactory(schema);