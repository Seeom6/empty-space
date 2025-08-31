import { ProjectPriority, ProjectStatus } from "@Modules/project/types";
import { ZodValidation, zodValidationPipeFactory } from "@Package/api";
import z from "zod";

const schema =z.object({
    name: z.string(),
    description: z.string(),
    members: z.array(ZodValidation.isMongoId),
    technology: z.array(ZodValidation.isMongoId),
    manger:ZodValidation.isMongoId,
    endDate: z.date(),
    budget: z.number().positive(),
    startDate: z.date(),
    deadline: z.date().optional(),
    priority: z.enum([...Object.values(ProjectPriority)]),
    status: z.enum([...Object.values(ProjectStatus)]),
    tags: z.array(z.string()).optional().default([])
})

export type CreateProjectDto = z.infer<typeof schema>

export const CreateProjectValidator = zodValidationPipeFactory(schema)