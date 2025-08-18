import { zodValidationPipeFactory } from "@Package/api";
import z from "zod";


const schema = z.object({
    password: z.string().min(3).max(255),
});

export type UpdateEmployeePasswordDto = z.infer<typeof schema>;

export const UpdateEmployeePasswordDtoValidator = zodValidationPipeFactory(schema); 