import { applyDecorators } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import {UserTypesMetadata} from "src/package/api";
import {UserTypesGuard} from "@Package/auth/guards/permission.guard";
import { AccountRole } from '@Modules/account/account/types/role.enum';

export function AllowRole(...values: AccountRole[]) {
  return applyDecorators(
    UserTypesMetadata(values),
    UseGuards(UserTypesGuard),
  );
}
