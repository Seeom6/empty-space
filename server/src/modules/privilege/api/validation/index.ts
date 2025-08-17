import { Injectable } from "@nestjs/common";
import { privilegeKeys } from "../../../shared/config/privilege";
@Injectable()
export class PrivilegeValidation {
  static policy(): { get: [string, ...string[]] } {
    return { get: [privilegeKeys.createOperator, privilegeKeys.createRole] };
  }
}
