import { zodValidationPipeFactory } from "@Package/api";
import z from "zod";

/**
 * Enhanced validation schema for creating a department
 * Includes comprehensive validation rules and error messages
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
        ),

    /**
     * Optional department description
     */
    description: z.string()
        .trim()
        .max(1000, 'Description cannot exceed 1000 characters')
        .optional()
        .transform(val => val === '' ? undefined : val),

    /**
     * Department status - defaults to ACTIVE
     */
    status: z.enum(["ACTIVE", "INACTIVE"], {
        message: 'Status must be either ACTIVE or INACTIVE'
    }).optional().default("ACTIVE"),
});

export type CreateDepartmentDto = z.infer<typeof schema>;

export const CreateDepartmentDtoValidator = zodValidationPipeFactory(schema);
