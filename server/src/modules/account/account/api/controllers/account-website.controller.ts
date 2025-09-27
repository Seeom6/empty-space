import { Account, AuthWebController } from "@Package/api";

import { AccountService } from "../../services";
import { Body, Get, Patch, Post } from "@nestjs/common";
import { IAccount } from "../../types/account.interface";

@AuthWebController({
  prefix: "account",
})
export class AccountMobileController {
  constructor(
    private readonly accountService: AccountService,
  ) {}

  @Get("me")
  async getMe(@Account() user: IAccount) {
    console.log('🔍 GET /website/account/me called with user:', user);

    // Get full user details from database
    const fullUser = await this.accountService.findById(user.accountId);
    console.log('✅ Found full user data:', fullUser);

    // Return user data in the expected format
    return {
      data: {
        user: {
          id: fullUser._id.toString(),
          email: fullUser.email,
          firstName: fullUser.firstName || 'User',
          lastName: fullUser.lastName || 'Account',
          accountRole: fullUser.accountRole,
          isVerified: fullUser.isVerified || true,
          phoneNumber: fullUser.phoneNumber,
          employee: fullUser.employee || undefined
        }
      },
      message: 'User profile retrieved successfully'
    };
  }

  @Patch("update-me")
  async updateMe(@Account() user: IAccount, @Body() body: any) {
    await this.accountService.updateMe(body, user);
  }
}
