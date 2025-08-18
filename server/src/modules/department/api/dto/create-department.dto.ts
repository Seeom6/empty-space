import { zodValidationPipeFactory } from "@Package/api";
import z from "zod";


const schema = z.object({
    name: z.string().min(3).max(255),
    description: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});

export type CreateDepartmentDto = z.infer<typeof schema>;

export const CreateDepartmentDtoValidator = zodValidationPipeFactory(schema);
