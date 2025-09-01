import z from "zod";
import {ZodValidation, zodValidationPipeFactory} from "@Package/api";
import {ProjectPriority, ProjectStatus} from "@Modules/project/types";


const schema = z.object({
  ...ZodValidation.pagination(),
  status: z.enum(Object.values(ProjectStatus)).optional(),
  priority: z.enum(Object.values(ProjectPriority)).optional(),
  manger: ZodValidation.isMongoId.optional(),
});

export type GetAllProjectDto = z.infer<typeof schema>
export const GetAllProjectValidator = zodValidationPipeFactory(schema)