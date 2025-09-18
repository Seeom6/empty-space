import z from "zod";
import { zodValidationPipeFactory } from "@Package/api";


const schema = z.object({
    phoneNumber: z.string()
        .regex(/^\+?[1-9]\d{6,14}$/, 'Phone number must be in international format (e.g., +1234567890)')
        .optional(),
    password: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    accountRole: z.string(),
    email: z.string().email().optional(),
});

export type SingInDto = z.infer<typeof schema>;
export const SingInDtoValidation = zodValidationPipeFactory(schema);
