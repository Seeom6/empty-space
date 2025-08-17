import { ZodValidation } from "@Package/api";
import { z } from "zod";
import { zodValidationPipeFactory } from "@Package/api/validation";


const getAllAccountDtoSchema = z.object({
    ...ZodValidation.pagination(),
    accountType: z.enum(["user", "company"]),
    searchValue: z.string().optional(),
});

export type GetAllAccountDto = z.infer<typeof getAllAccountDtoSchema>;

export const getAllAccountDtoValidation = zodValidationPipeFactory(getAllAccountDtoSchema);
