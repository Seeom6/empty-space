import { Body, Param, Patch } from "@nestjs/common";

import { AccountService } from "../../services";
import { UpdateAccountRequestDto } from "../dto/update-account.dto";
import { IParamsId, Account } from "@Package/api";
import { AdminController } from "@Package/api";
import { IAccount } from "../../types/account.interface";
@AdminController({
  prefix: "account",
})
export class AccountDashboardController {
  constructor(
    private readonly accountService: AccountService,
  ) {}

  @Patch()
  async activateAccount(@Param() paramsId: IParamsId, @Body() body: {isActive: boolean}) {

    return await this.accountService.activateAccount(paramsId.id, body);
  }

  //######################### Update Account Api #########################
  @Patch("update")
  async update(
    @Param() paramsId: IParamsId,
    @Body() body: UpdateAccountRequestDto, 
    @Account() user: IAccount
  ) {
    await this.accountService.update(paramsId, body);
    return;
  }

}
