import { ZodValidation } from "@Package/api";
import { z } from "zod";
import { zodValidationPipeFactory } from "@Package/api/validation";

const getByCriteriaAccountRequestSchema = z.object({
    ...ZodValidation.pagination(),
    type: z.boolean(),
});

export type getByCriteriaAccountDto = z.infer<typeof getByCriteriaAccountRequestSchema>;
export const getByCriteriaAccountRequestValidation = zodValidationPipeFactory(getByCriteriaAccountRequestSchema);

const checkAccountRequestSchema = z.object({
    email: z.string(),
    phoneNumber: z.string(),
});

export type checkAccountDto = z.infer<typeof checkAccountRequestSchema>;
export const checkAccountRequestValidation = zodValidationPipeFactory(checkAccountRequestSchema);
