import z from "zod";
import { zodValidationPipeFactory } from "@Package/api";

const schema = z.object({
  oldEmail: z.string(),
  newEmail: z.string(),
  password: z.string(),
});

export type UpdateOwnerEmailDto = z.infer<typeof schema>;
export const updateOwnerEmailDtoValidation = zodValidationPipeFactory(schema);
