import { AuthModule } from "./auth";
import { PrivilegeModule } from "./privilege/privilege.module";
import { RoleModule } from "./role/role.module";
import { LocalFileModule } from "./file/local/local-file.module";
import { AgendaModule } from "./agenda";
import { AccountModule } from "./account/account/account.module";
import { OperatorModule } from "./account/operator/operator.module";
import { UserModule } from "./account/user/user.module";
import { TechnologyModule } from "./technology/technology.module";

export const Modules = [
  OperatorModule,
  AccountModule,
  PrivilegeModule,
  RoleModule,
  UserModule,
  AuthModule,
  LocalFileModule,
  TechnologyModule
  // AgendaModule
];
