import { z } from 'zod';
import { zodValidationPipeFactory } from '@Package/api';
import { ZodValidation } from '@Package/api';

const getByCriteriaRoleRequestSchema = z.object({
    name: z.string(),
    ...ZodValidation.pagination(),
})


export type GetByCriteriaRoleRequestDto = z.infer<typeof getByCriteriaRoleRequestSchema>

export const GetByCriteriaRoleRequestValidation = zodValidationPipeFactory(getByCriteriaRoleRequestSchema)

