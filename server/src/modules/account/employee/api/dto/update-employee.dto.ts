import z from "zod";
import { zodValidationPipeFactory } from "@Package/api";

const schema = z.object({
    firstName: z.string().min(3).max(255),
    lastName: z.string().min(3).max(255),
    phoneNumber: z.string().min(3).max(255),
    email: z.string().min(3).max(255),
    departmentId: z.string(),
    positionId: z.string(),
    employmentType: z.string(),
    baseSalary: z.number(),
    technologies: z.array(z.string()),
    image: z.string().optional(),
});

export const UpdateEmployeeDtoValidator = zodValidationPipeFactory(schema);

export type UpdateEmployeeDto = z.infer<typeof schema>;
