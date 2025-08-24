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
    birthday: z.date().optional(),
})


export type RegisterEmployeeDto = z.infer<typeof schema>

export const RegisterEmployeeValidator = zodValidationPipeFactory(schema)