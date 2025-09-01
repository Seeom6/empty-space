import { ProjectPriority, ProjectStatus } from "@Modules/project/types";
import { ZodValidation, zodValidationPipeFactory } from "@Package/api";
import z from "zod";

const schema =z.object({
    name: z.string(),
    description: z.string(),
    members: z.array(ZodValidation.isMongoId),
    technology: z.array(z.string()),
    manger:ZodValidation.isMongoId,
    endDate: z.coerce.date(),
    budget: z.number().positive(),
    startDate: z.coerce.date(),
    deadline: z.coerce.date().optional(),
    priority: z.enum([...Object.values(ProjectPriority)]),
    status: z.enum([...Object.values(ProjectStatus)]),
    tags: z.array(z.string()).optional().default([])
})

export type CreateProjectDto = z.infer<typeof schema>

export const CreateProjectValidator = zodValidationPipeFactory(schema)