import { UseGuards } from "@nestjs/common";
import { PoliciesGuard } from "src/package/auth/guards/policies.guard";
import { applyDecorators } from "@nestjs/common";
import { Policies } from "./policies.decorator";
import { PoliciesGuardNoActions } from "../guards/policies-no-action.guard";
import { PoliciesNoAction } from "./policies-no-action.decorator";

export function PrivilegePolicy({
    privilegeKeys,
    policyAccessMode = [],
}: {
    privilegeKeys: [string, ...string[]];
    policyAccessMode?: string[];
}) {
    return policyAccessMode.length !== 0
        ? applyDecorators(
            UseGuards(PoliciesGuard), 
            Policies(privilegeKeys, policyAccessMode),
        )
        : applyDecorators(
            UseGuards(PoliciesGuardNoActions), 
            PoliciesNoAction(privilegeKeys),
        );
}
