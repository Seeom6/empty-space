import { zodValidationPipeFactory } from "@Package/api";
import z from "zod";
import { InviteCodeStatus } from "@Modules/invite-code/types";


const schema = z.object({
    status: z.enum([...Object.values(InviteCodeStatus)]),
    code: z.string()
})

export type UpdateInviteCodeStatusDto = z.infer<typeof schema>

export const updateInviteCodeStatusDtoValidation = zodValidationPipeFactory(schema);
    