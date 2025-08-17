import {Body, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '@Modules/auth';
import { LogInDto } from '../dto/request/logIn.dto';
import {IRefreshToken} from 'src/package/auth';
import {RefreshTokenGuard} from "@Package/auth/guards";
import {RefreshPayload} from "@Package/api/decorators/refresh-payload.decorator";
import { Account, AccountPayload, AuthWebController, WebController } from '@Package/api';
import { SingInDto } from '../dto/request/singIn.dto';
import { Request, Response } from 'express';
import { RedisKeys } from '@Common/cache';

@WebController({
   prefix: "auth"
})
export class AuthController {
   constructor(
      private readonly authService: AuthService,
   ){}
   
   @Post("sign-in")
   async singIn(
      @Body() body: SingInDto,
      @Res({passthrough: true}) res: Response
   ){
      const tokens = await this.authService.signIn(body)
      res.cookie(RedisKeys.REFRESH_TOKEN, tokens.refreshToken, {httpOnly: true});
      return {
         accessToken: tokens.accessToken
      }
   }

   @Post("seller-sign-in")
   async sellerSignIn(
      @Body() body: SingInDto,
      @Res({passthrough: true}) res: Response
   ){
      const tokens = await this.authService.signIn(body)
      res.cookie(RedisKeys.REFRESH_TOKEN, tokens.refreshToken, {httpOnly: true});
      return {
         accessToken: tokens.accessToken
      }
   }


   @Post('log-in')
   async logIn(@Body() logInInfo: LogInDto, @Res({passthrough: true}) res: Response ) {
      const tokens = await this.authService.logIn(logInInfo);
      res.cookie(RedisKeys.REFRESH_TOKEN, tokens.refreshToken, {httpOnly: true});
      return {
         accessToken: tokens.refreshToken
      }
   }

}

@AuthWebController({prefix: "auth"})
export class AuthControllerWithToken {
   constructor(
      private readonly authService: AuthService,
   ){}

   @Post('verify-otp')
   async verifyOtp(@Account() user: AccountPayload, @Body() body: { otp: string }) {
      return await this.authService.verifyOtp(user.email, body.otp);
   }

   @Post('verify-reset-otp')
   async verifyResetOtp(@Account() user: AccountPayload, @Body() body: { otp: string }) {
      return this.authService.verifyResetOtp(user.email, body.otp);
   }

   @Post('reset-password')
   async resetPassword(
      @Account() user: AccountPayload,
      @Body() body: { 
         otp: string; 
         newPassword: string;
      }
   ) {
      return await this.authService.resetPassword(user.email, body.newPassword);
   }

   @Post("logout")
   async  logout(@Body() user: AccountPayload, @Res() res: Response) {

   }
}

@UseGuards(RefreshTokenGuard)
@WebController({
   prefix: "auth"
})
export class RefreshController {
   constructor(
      private readonly authService: AuthService,
   ){}

   @Post('refresh')
   async refreshToken(@RefreshPayload() payload: IRefreshToken, @Res({passthrough: true}) res:  Response) {
      const tokens = await this.authService.refreshToken(payload, res)
      res.cookie(RedisKeys.REFRESH_TOKEN, tokens.refreshToken, {httpOnly: true});
      return {
         accessToken: tokens.accessToken
      }
   }

   @Post("log-out")
   async logout(@RefreshPayload() payload: IRefreshToken, @Res({passthrough: true}) res: Response){
      res.cookie(RedisKeys.REFRESH_TOKEN, null);
      return;
   }
}

