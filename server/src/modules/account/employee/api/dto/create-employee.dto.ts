import z from "zod";
import { zodValidationPipeFactory } from "@Package/api";
import { EmploymentType } from "../../types";

const schema = z.object({
    firstName: z.string().min(3).max(255),
    lastName: z.string().min(3).max(255),
    phoneNumber: z.string().min(3).max(255),
    email: z.string().min(3).max(255),
    password: z.string().min(3).max(255),
    departmentId: z.string(),
    positionId: z.string(),
    employmentType: z.enum(Object.values(EmploymentType)),
    baseSalary: z.number(),
    technologies: z.array(z.string()),
    image: z.string().optional(),
    birthday: z.date().optional(),
});

export type CreateEmployeeDto = z.infer<typeof schema>;

export const CreateEmployeeDtoValidator = zodValidationPipeFactory(schema);
