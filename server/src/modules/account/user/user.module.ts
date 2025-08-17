import { UserService } from "./services";
import { Module, forwardRef } from "@nestjs/common";
import { UserError } from "./services/user.error";
import { AccountModule } from "../account/account.module";
import { RedisModule } from "@Infrastructure/cache";

@Module({
  controllers: [],
  providers: [
    UserService,
    UserError,
  ],
  imports: [
    forwardRef(() => AccountModule),
    RedisModule
  ],
  exports: [UserService],
})
export class UserModule {}
