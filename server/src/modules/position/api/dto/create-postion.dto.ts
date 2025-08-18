import { zodValidationPipeFactory } from "@Package/api";
import z from "zod";
import { PositionStatus } from "@Modules/position/types/position-status.type";

const schema = z.object({
    name: z.string().min(3).max(255),
    departmentId: z.string(),
    description: z.string().optional(),
    status: z.enum([PositionStatus.ACTIVE, PositionStatus.INACTIVE]).optional().default(PositionStatus.ACTIVE),
}); 

export type CreatePositionDto = z.infer<typeof schema>;

export const CreatePositionDtoValidator = zodValidationPipeFactory(schema);
