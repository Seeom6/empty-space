import { Account, AuthWebController } from "@Package/api";

import { AccountService } from "../../services";
import { Body, Get, Patch, Post } from "@nestjs/common";
import { IAccount } from "../../types/account.interface";

@AuthWebController({
  prefix: "website/account",
})
export class AccountMobileController {
  constructor(
    private readonly accountService: AccountService,
  ) {}

  @Patch("update-me")
  async updateMe(@Account() user: IAccount, @Body() body: any) {
    await this.accountService.updateMe(body, user);
  }
}
