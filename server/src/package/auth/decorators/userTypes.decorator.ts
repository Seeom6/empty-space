import { SetMetadata } from "@nestjs/common";

export const CHECK_TYPES_KEY = "userType";
export const UserTypesMetadata = (values: string[]) =>
  SetMetadata(CHECK_TYPES_KEY, { values });
