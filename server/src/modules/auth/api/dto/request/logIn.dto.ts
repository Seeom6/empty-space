import z from "zod";
import { zodValidationPipeFactory } from "@Package/api";

const schema = z.object({
    email: z.string(),
    password: z.string(),
});

export type LogInDto = z.infer<typeof schema>;
export const logInDtoValidation = zodValidationPipeFactory(schema);