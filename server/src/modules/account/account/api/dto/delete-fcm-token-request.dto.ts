import z from "zod";
import { zodValidationPipeFactory } from "@Package/api/validation";

const FcmTokenSchema = z.object({
    fcmToken: z.string(),
});

export type FcmToken = z.infer<typeof FcmTokenSchema>;

export const FcmTokenValidation = zodValidationPipeFactory(FcmTokenSchema);
