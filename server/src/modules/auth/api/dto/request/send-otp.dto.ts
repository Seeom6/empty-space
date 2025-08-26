import { zodValidationPipeFactory } from "@Package/api"
import z from "zod"


const schema = z.object({
    email: z.email(),
})

export type SendOtpDto = z.infer<typeof schema>

export const sendOtpValidation = zodValidationPipeFactory(schema)
