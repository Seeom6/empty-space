import { ZodValidation, zodValidationPipeFactory } from "@Package/api";
import z from "zod";
import { EmployeeStatus, EmploymentType } from "../../types";


const schema = z.object({
    department: ZodValidation.isMongoId.optional(),
    position: ZodValidation.isMongoId.optional(),
    employmentType: z.enum([...Object.values(EmploymentType)]).optional(),
    status: z.enum([...Object.values(EmployeeStatus)]).optional(),
    searchValue: z.string().optional(),
    ...ZodValidation.pagination()
})

export type GetAllEmployeeDto = z.infer<typeof schema>

export const GetAllEmployeeDtoValidator = zodValidationPipeFactory(schema); 