import z from "zod";
import { zodValidationPipeFactory } from "@Package/api";

const schema = z.object({
    email: z.string()
        .email('Invalid email format')
        .max(254, 'Email must not exceed 254 characters')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(1, 'Password is required')
        .max(128, 'Password must not exceed 128 characters')
        .refine(
            (password) => password.length > 0 && !password.includes('\0'),
            'Password contains invalid characters'
        ),
});

export type LogInDto = z.infer<typeof schema>;
export const logInDtoValidation = zodValidationPipeFactory(schema);