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
import {EmployeeService} from "@Modules/account/account/services/employee.service";

@Module({
  providers: [
    AccountError,
    AccountOperatorService,
    AccountRepository,
    AccountService,
    EmployeeService,
    EmployeeService
  ],
  controllers: [AccountDashboardController, AccountMobileController],
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    forwardRef(() => UserModule),
    RedisModule
  ],
  exports: [AccountOperatorService, AccountService, AccountRepository, EmployeeService],
})
export class AccountModule {}
