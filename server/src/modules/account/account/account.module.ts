import { Account, AccountSchema } from "./data/schemas/account.schema";

import { AccountError } from "./services/account.error";
import { AccountRepository } from "./data/repository/account.repository";
import { AccountOperatorService, AccountService } from "./services";
import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  AccountDashboardController,
  AccountMobileController,
} from "./api/controllers";
import { UserModule } from "../user/user.module";
import { RedisModule } from "@Infrastructure/cache";

@Module({
  providers: [
    AccountError,
    AccountOperatorService,
    AccountRepository,
    AccountService,
  ],
  controllers: [AccountDashboardController, AccountMobileController],
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    forwardRef(() => UserModule),
    RedisModule
  ],
  exports: [AccountOperatorService, AccountService],
})
export class AccountModule {}
