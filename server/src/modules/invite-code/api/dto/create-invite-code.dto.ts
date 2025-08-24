import { ZodValidation, zodValidationPipeFactory } from "@Package/api";
import z from "zod";


const schema = z.object({
    // code: z.string().min(4).max(8),
    position: ZodValidation.isMongoId,
    privilege: z.array(ZodValidation.isMongoId)
})

export type CreateInviteCodeDto  = z.infer<typeof schema>

export const CreateInviteCodeValidation = zodValidationPipeFactory(schema)