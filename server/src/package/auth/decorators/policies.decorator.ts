import { SetMetadata } from "@nestjs/common";

export const CHECK_POLICIES_KEY = "policies";
export const Policies = (keys: [string, ...string[]], values: string[]) =>
  SetMetadata(CHECK_POLICIES_KEY, { keys, values });
