import z from "zod";
import { zodValidationPipeFactory } from "@Package/api";

const schema = z.object({
    firstName: z.string().min(3).max(255),
    lastName: z.string().min(3).max(255),
    phoneNumber: z.string().min(3).max(255),
    email: z.string().min(3).max(255),
    password: z.string().min(3).max(255),
    departmentId: z.string(),
    positionId: z.string(),
    employmentType: z.string(),
    baseSalary: z.number(),
    image: z.string().optional(),
});

export type CreateEmployeeDto = z.infer<typeof schema>;

export const CreateEmployeeDtoValidator = zodValidationPipeFactory(schema);
