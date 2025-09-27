import { zodValidationPipeFactory } from "@Package/api";
import z from "zod";

/**
 * Enhanced validation schema for updating a department
 * All fields are optional for partial updates
 */
const schema = z.object({
    /**
     * Department name - must be unique, alphanumeric with spaces, hyphens, underscores
     */
    name: z.string()
        .trim()
        .min(3, 'Department name must be at least 3 characters')
        .max(255, 'Department name cannot exceed 255 characters')
        .regex(
            /^[a-zA-Z0-9\s\-_&().,]+$/,
            'Department name can only contain letters, numbers, spaces, hyphens, underscores, and basic punctuation'
        )
        .refine(
            (name) => !name.match(/^\s|\s$/),
            'Department name cannot start or end with spaces'
        )
        .optional(),

    /**
     * Optional department description
     */
    description: z.string()
        .trim()
        .max(1000, 'Description cannot exceed 1000 characters')
        .optional()
        .transform(val => val === '' ? undefined : val),

    /**
     * Department status
     */
    status: z.enum(["ACTIVE", "INACTIVE"], {
        message: 'Status must be either ACTIVE or INACTIVE'
    }).optional(),
})
.refine(
    (data) => Object.keys(data).length > 0,
    'At least one field must be provided for update'
);

export type UpdateDepartmentDto = z.infer<typeof schema>;

export const UpdateDepartmentDtoValidator = zodValidationPipeFactory(schema);