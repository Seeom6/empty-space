import { zodValidationPipeFactory } from "@Package/api";
import z from "zod";

const schema = z.object({
  newToken: z.string(),
});

export type RefreshFcmTokenDto = z.infer<typeof schema>;
export const refreshFcmTokenValidation = zodValidationPipeFactory(schema);
