import { zodValidationPipeFactory } from "@Package/api";
import z from "zod";

const schema = z.object({
    name: z.string(),
    description: z.string(),
    status: z.string(),
    icon: z.string(),
    website: z.string(),
    version: z.string(),
    category: z.string(),
})

export type UpdateTechnologyRequestDto = z.infer<typeof schema>

export const UpdateTechnologyValidation = zodValidationPipeFactory(schema);