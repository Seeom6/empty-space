import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Connection } from 'mongoose';

import { HashService } from 'src/package/auth';
import { AppError } from '@Package/error/app.error';
import { SingInDto } from '../api/dto/request/singIn.dto';
import { LogInDto } from '../api/dto/request/logIn.dto';
import { AuthError } from './auth.error';
import { ErrorCode } from "../../../common/error/error-code";
import { v4 as uuidv4 } from "uuid"
import { IRefreshToken } from "@Package/auth/types/refresh-token.type";
import { Request, Response } from "express";
import { TokenConstant } from "../../../common/auth/token.constant";
import { AccountService } from '@Modules/account/account/services';
import { RedisService } from '@Infrastructure/cache';
import { EnvironmentService } from '@Infrastructure/config';
import { AccountPayload } from '@Package/api';
import { generateOTP } from '@Package/utilities';
import { RedisKeys } from '@Common/cache';

@Injectable()
export class AuthService {
   constructor(
      private readonly jwtService: JwtService,
      private readonly accountService: AccountService,
      private readonly authError: AuthError,
      private readonly redisService: RedisService,
      private readonly environmentService: EnvironmentService,
      @InjectConnection() private readonly connection: Connection
   ) { }


   public async signIn(userSignInInfo: SingInDto) {
      const isExist = await this.accountService.findByPhone(userSignInInfo.phoneNumber, false);
      if(isExist) {
         this.authError.throw(ErrorCode.USER_ALREADY_EXISTS);
      }
      let accessToken: string;
      let refresh: IRefreshToken;
      let refreshToken: string;
      const session = await this.connection.startSession()
      await session.withTransaction(async(session)=>{
         const hashedPassword = await HashService.hashPassword(userSignInInfo.password);
         const user = await this.accountService.createAccount({
            ...userSignInInfo,
            password: hashedPassword
         },
      {
         session
      });
   
         const userPayload: AccountPayload = {
            accountId: user._id.toString(),
            accountRole: user.accountRole,
            isActive: user.isActive,
            email: user.email,
            isVerified: user.isVerified
         };
   
         accessToken = this.jwtService.sign(userPayload);
         refresh = {
            userId: user._id.toString(),
         }
         const otp = generateOTP();
         const jwtId = uuidv4()

         await this.redisService.set(`otp:${user.phoneNumber}`, otp, 30000000); 
         refreshToken = this.jwtService.sign(refresh, {jwtid: jwtId, secret: this.environmentService.get("jwt.jwtAccessSecret"),expiresIn: this.environmentService.get("jwt.jwtExpiredRefresh")});
         await this.redisService.set(
            `${RedisKeys.REFRESH_TOKEN}:${user._id.toString()}:${jwtId}`,
            refreshToken,
            this.environmentService.get("jwt.ttlRefreshToken")
         );
         })
      return {
         accessToken: accessToken,
         refreshToken: refreshToken,
      };
   }

   async logIn(logInInfo: LogInDto) {
      const user = await this.accountService.findByEmail(logInInfo.email, false);
      if (!user) {
         this.authError.throw(ErrorCode.INVALID_CREDENTIALS);
      }

      const isPasswordValid = await HashService.comparePassword(
         logInInfo.password,
         user.password
      );
      // if (!isPasswordValid) {
      //    this.authError.throw(ErrorCode.INVALID_CREDENTIALS);
      // }

      const userPayload: AccountPayload = {
         accountId: user._id.toString(),
         accountRole: user.accountRole,
         isActive: user.isActive,
         email: user.email,
         isVerified: user.isVerified
      };

      const jwtId = uuidv4()

      const refresh: IRefreshToken = {
         userId: user._id.toString(),
      }
      const tokens = await this.redisService.getByPattern(`${RedisKeys.REFRESH_TOKEN}:${user._id.toString()}`)
      if (tokens.elements.length + 1 > TokenConstant.MAX_USER_TOKEN_COUNT) {
         const olderToken = await this.getOldTokenInRedis(tokens.elements)
         await this.redisService.del([olderToken.token])
      }
      const accessToken = this.jwtService.sign(userPayload);
      const refreshToken = this.jwtService.sign(refresh, { jwtid: jwtId, secret: this.environmentService.get("jwt.jwtAccessSecret"), expiresIn: this.environmentService.get("jwt.jwtExpiredRefresh") });
      await this.redisService.set(
         `${RedisKeys.REFRESH_TOKEN}:${user._id.toString()}:${jwtId}`,
         refreshToken,
         this.environmentService.get("jwt.ttlRefreshToken")
      );

      return {
         accessToken: accessToken,
         refreshToken: refreshToken,
      };
   }

   async verifyOtp(phoneNumber: string, otp: string): Promise<{ message: string }> {
         const storedOtp = await this.redisService.get<string>(`otp:${phoneNumber}`);
         if (!storedOtp) {
            this.authError.throw(ErrorCode.OTP_EXPIRED);
         }
         if (storedOtp.toString() !== otp) {
            this.authError.throw(ErrorCode.INVALID_OTP);
         }
         await this.accountService.updateByPhone(phoneNumber, { isVerified: true });
         await this.redisService.del([`otp:${phoneNumber}`]);

         return { message: 'OTP verified successfully' };
   }

   async requestPasswordReset(email: string): Promise<{ message: string; token: string }> {
      const user = await this.accountService.findByEmail(email, false);
      if (!user) {
         return {
            message: 'If an account exists with this email, you will receive a password reset email',
            token: ''
         };
      }

      const token = this.jwtService.sign(
         { email, type: 'password_reset' },
         { expiresIn: '15m' }
      );

      await this.redisService.set(`reset_token:${email}`, token, 900);

      return {
         message: 'If an account exists with this email, you will receive a password reset email',
         token
      };
   }

   async verifyResetOtp(email: string, otp: string): Promise<{ message: string; token: string }> {
      try {
         const storedOtp = await this.redisService.get<string>(`reset:${email}`);
         if (!storedOtp) {
            this.authError.throw(ErrorCode.OTP_EXPIRED);
         }

         if (storedOtp !== otp) {
            this.authError.throw(ErrorCode.INVALID_OTP);
         }

         const resetToken = this.jwtService.sign(
            { email, type: 'password_reset' },
            { expiresIn: '15m' }
         );

         await this.redisService.del([`reset:${email}`]);
         await this.redisService.set(`reset_token:${email}`, resetToken, 90000000); // 15 minutes

         return {
            message: 'OTP verified successfully',
            token: resetToken
         };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         this.authError.throw(ErrorCode.OTP_VERIFICATION_FAILED);
      }
   }

   async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
      try {
         const hashedPassword = await HashService.hashPassword(newPassword);
         await this.accountService.updateByPhone(email, { password: hashedPassword });
         return { message: 'Password has been reset successfully' };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         this.authError.throw(ErrorCode.OTP_VERIFICATION_FAILED);
      }
   }

   async refreshToken(payload: IRefreshToken, res: Response) {
      const refreshRedisToken = await this.redisService.get<string>(`${RedisKeys.REFRESH_TOKEN}:${payload.userId}:${payload.jti}`)
      if (!refreshRedisToken) {
         this.authError.throw(ErrorCode.REFRESH_TOKEN_NOT_IN_REDIS);
      }

      const decodeToken: IRefreshToken = await this.jwtService.decode(refreshRedisToken);
      if (decodeToken.jti !== payload.jti) {
         await this.redisService.del([`${RedisKeys.REFRESH_TOKEN}:${payload.userId}`])
         res.cookie(`${RedisKeys.REFRESH_TOKEN}`, null)
         this.authError.throw(ErrorCode.INVALID_TOKEN);
      }

      const user = await this.accountService.findById(payload.userId);

      const userPayload: AccountPayload = {
         accountId: user._id.toString(),
         accountRole: user.accountRole,
         isActive: user.isActive,
         email: user.email,
         isVerified: user.isVerified
      };

      const jwtId = uuidv4()

      const refresh: IRefreshToken = {
         userId: user._id.toString(),
      }

      const accessToken = this.jwtService.sign(userPayload);
      const refreshToken = this.jwtService.sign(refresh, {
         jwtid: jwtId,
         secret: this.environmentService.get("jwt.jwtRefreshSecret"),
         expiresIn: this.environmentService.get("jwt.jwtExpiredRefresh")
      });
      await this.redisService.del([`${RedisKeys.REFRESH_TOKEN}:${user._id.toString()}`])
      await this.redisService.set(`${RedisKeys.REFRESH_TOKEN}:${user._id.toString()}`, refreshToken);
      return { accessToken, refreshToken: refreshToken };
   }

   async logOut(payload: IRefreshToken, res: Response) {
      const refreshRedisToken = await this.redisService.get<string>(`${RedisKeys.REFRESH_TOKEN}:${payload.userId}:${payload.jti}`)
      if (!refreshRedisToken) {
         this.authError.throw(ErrorCode.REFRESH_TOKEN_NOT_IN_REDIS);
      }
      const decodeToken: IRefreshToken = await this.jwtService.decode(refreshRedisToken);
      const result = await this.redisService.getByPattern(`${RedisKeys.REFRESH_TOKEN}:${payload.userId}`)
      await this.getOldTokenInRedis(result.elements)
      if (decodeToken.jti !== payload.jti) {
         const result = await this.redisService.getByPattern(`${RedisKeys.REFRESH_TOKEN}:${payload.userId}`)
         await this.redisService.del(result.elements)
         await this.redisService.del([`${RedisKeys.REFRESH_TOKEN}:${payload.userId}`])
         res.cookie(`${RedisKeys.REFRESH_TOKEN}`, null)
         this.authError.throw(ErrorCode.INVALID_TOKEN);
      }
      await this.redisService.del([`${RedisKeys.REFRESH_TOKEN}:${payload.userId}:${payload.jti}`])
      return;

   }

   private async getOldTokenInRedis(keys: string[]): Promise<{ token: string, ttl: number }> {
      const ttls = await Promise.all(keys.map(async (key) => {
         const ttl = await this.redisService.ttl(key)
         return {
            token: key,
            ttl: ttl
         }
      }))
      ttls.sort((a, b) => a.ttl - b.ttl)
      return ttls[0];
   }
}
