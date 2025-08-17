import { z } from "zod";
import { zodValidationPipeFactory } from "@Package/api";
import { ZodValidation } from "@Package/api/validation";

const updateRoleRequestSchema = z.object({
    name: ZodValidation.localizableString(),
    privileges: z.array(z.string()),
})

export type UpdateRoleRequestDto = z.infer<typeof updateRoleRequestSchema>

export const UpdateRoleRequestValidation = zodValidationPipeFactory(updateRoleRequestSchema)

