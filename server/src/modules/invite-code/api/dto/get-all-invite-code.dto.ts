import { InviteCodeStatus } from "@Modules/invite-code/types";
import { ZodValidation, zodValidationPipeFactory } from "@Package/api";
import z from "zod";


const schema = z.object({
    status: z.enum([...Object.values(InviteCodeStatus)]).optional(),
    position: ZodValidation.isMongoId.optional(),
    ...ZodValidation.pagination()
})

export type GetAllInviteCodeDto = z.infer<typeof schema>

export const GetAllInviteCodeValidator = zodValidationPipeFactory(schema)