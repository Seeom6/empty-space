import { SetMetadata } from '@nestjs/common';

export const CHECK_POLICIES_KEY = 'policies';
export const PoliciesNoAction = (keys: [string, ...string[]]) =>
  SetMetadata(CHECK_POLICIES_KEY, { keys });
