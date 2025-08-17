import { TechnologyStatus } from "@Modules/technology/types";
import { zodValidationPipeFactory } from "@Package/api";
import z from "zod";

const schema = z.object({
    name: z.string(),
    description: z.string(),
    status: z.string().default(TechnologyStatus.ACTIVE),
    icon: z.string(),
    website: z.string(),
    version: z.string(),
    category: z.string(),
})

export type CreateTechnologyRequestDto = z.infer<typeof schema>

export const CreateTechnologyValidation = zodValidationPipeFactory(schema);