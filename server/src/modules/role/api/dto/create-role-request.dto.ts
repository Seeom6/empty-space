import { z } from "zod";
import { zodValidationPipeFactory } from "@Package/api";
import { ZodValidation } from "@Package/api/validation";


export const createRoleRequestSchema = z.object({
    name: ZodValidation.localizableString(),
    buildIn: z.boolean(),
    privileges: z.array(z.string()),
})

export type CreateRoleRequestDto = z.infer<typeof createRoleRequestSchema>

export const createRoleRequestValidation = zodValidationPipeFactory(createRoleRequestSchema)
