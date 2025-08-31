import { zodValidationPipeFactory } from "@Package/api"
import z from "zod"

const schema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string().optional(),
    email: z.string(),
    password: z.string(),
    inviteCode: z.string(),
    image: z.string().optional(),
    birthday: z.string().optional().transform((val) => val ? new Date(val) : undefined),
})


export type RegisterEmployeeDto = z.infer<typeof schema>

export const RegisterEmployeeValidator = zodValidationPipeFactory(schema)