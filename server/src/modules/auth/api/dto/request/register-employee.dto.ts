import { zodValidationPipeFactory } from "@Package/api"
import z from "zod"

const schema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name must not exceed 50 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters')
        .trim(),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must not exceed 50 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters')
        .trim(),
    phoneNumber: z.string()
        .optional()
        .refine(
            (phone) => !phone || /^\+?[1-9]\d{1,14}$/.test(phone),
            'Invalid phone number format'
        ),
    email: z.string()
        .email('Invalid email format')
        .max(254, 'Email must not exceed 254 characters')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must not exceed 128 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    inviteCode: z.string()
        .min(1, 'Invite code is required')
        .max(50, 'Invite code must not exceed 50 characters')
        .regex(/^[A-Z0-9$-]+$/, 'Invalid invite code format')
        .trim(),
    image: z.string()
        .optional()
        .refine(
            (url) => !url || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url),
            'Invalid image URL format'
        ),
    birthday: z.string()
        .optional()
        .refine(
            (date) => !date || !isNaN(Date.parse(date)),
            'Invalid date format'
        )
        .transform((val) => val ? new Date(val) : undefined),
})


export type RegisterEmployeeDto = z.infer<typeof schema>

export const RegisterEmployeeValidator = zodValidationPipeFactory(schema)