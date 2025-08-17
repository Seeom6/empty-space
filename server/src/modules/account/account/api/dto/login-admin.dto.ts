import { z } from 'zod';
import { zodValidationPipeFactory } from '@Package/api/validation';

const schema =
    z.object({
        username: z.string(),
        password: z.string().min(6),
    })

export type LogInAdminDto = z.infer<typeof schema>

export const LogInAdminValidation = zodValidationPipeFactory(schema)