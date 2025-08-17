import z from "zod";
import { zodValidationPipeFactory } from "@Package/api";


const schema = z.object({
    phoneNumber: z.string(),
    password: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    accountRole: z.string(),
});

export type SingInDto = z.infer<typeof schema>;
export const SingInDtoValidation = zodValidationPipeFactory(schema);
