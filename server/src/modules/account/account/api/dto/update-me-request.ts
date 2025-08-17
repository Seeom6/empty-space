import z from "zod";
import { zodValidationPipeFactory } from "@Package/api";

const schema = z.object({
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  companyFullName: z.string().optional(),
  crNumber: z.string().optional(),
  email: z.string().optional(),
  city: z.string().optional(),
});

export type UpdateMeDto = z.infer<typeof schema>;
export const updateMeDtoValidation = zodValidationPipeFactory(schema);
