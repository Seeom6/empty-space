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
import { InjectQueue } from '@nestjs/bullmq';
import { QueuesNames } from '@Infrastructure/queue';
import { Queue } from 'bullmq';
import { SendOtpDto } from '../api/dto/request';
import { OtpService } from './otp.service';
import { RedisKeys as NewRedisKeys, RedisTTL } from './session.service';

@Injectable()
export class AuthService {
   constructor(
      private readonly jwtService: JwtService,
      private readonly accountService: AccountService,
      private readonly authError: AuthError,
      private readonly redisService: RedisService,
      private readonly environmentService: EnvironmentService,
      @InjectQueue(QueuesNames.MAIL) private readonly emailQueue: Queue,
      @InjectConnection() private readonly connection: Connection,
      private readonly otpService: OtpService
   ) { }


   public async signIn(userSignInInfo: SingInDto) {
      const isExist = await this.accountService.findByPhone(userSignInInfo.phoneNumber, false, true);
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
         const jwtId = uuidv4();
         refresh = {
            userId: user._id.toString(),
            jti: jwtId
         }
         const otp = generateOTP();

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

   async sendOtp(body: SendOtpDto) {
      const otp = generateOTP();
      // CRITICAL FIX: Changed from 30000000ms (8.3 hours) to 600 seconds (10 minutes)
      await this.redisService.set(`otp:${body.email}`, otp, 600);
      const otpToken = this.jwtService.sign({email: body.email, otp: otp}, {secret: this.environmentService.get("jwt.jwtAccessSecret"),expiresIn: '10m'});
      await this.emailQueue.add(QueuesNames.MAIL, {
         email: body.email,
         otp,
      })
      return otpToken
   }

   async logIn(logInInfo: LogInDto, res: Response) {
      const user = await this.accountService.findByEmail(logInInfo.email, false, true);
      if (!user) {
         this.authError.throw(ErrorCode.INVALID_CREDENTIALS);
      }

      const isPasswordValid = await HashService.comparePassword(
         logInInfo.password,
         user.password
      );
      if (!isPasswordValid) {
         this.authError.throw(ErrorCode.INVALID_CREDENTIALS);
      }

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
         jti: jwtId
      }

      // Clean up old tokens if limit exceeded
      const tokens = await this.redisService.getByPattern(`${NewRedisKeys.REFRESH_TOKEN(user._id.toString(), '*')}`)
      if (tokens.elements.length + 1 > TokenConstant.MAX_USER_TOKEN_COUNT) {
         const olderToken = await this.getOldTokenInRedis(tokens.elements)
         await this.redisService.del([olderToken.token])
      }

      const accessToken = this.jwtService.sign(userPayload);
      const refreshToken = this.jwtService.sign(refresh, {
         jwtid: jwtId,
         secret: this.environmentService.get("jwt.jwtRefreshSecret"),
         expiresIn: this.environmentService.get("jwt.jwtExpiredRefresh")
      });

      // Store refresh token in Redis
      await this.redisService.set(
         NewRedisKeys.REFRESH_TOKEN(user._id.toString(), jwtId),
         refreshToken,
         RedisTTL.REFRESH_TOKEN
      );

      // Set tokens as HTTP-only cookies
      this.setAuthCookies(res, accessToken, refreshToken);

      return {
         user: {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            accountRole: user.accountRole,
            isVerified: user.isVerified
         }
      };
   }

   async verifyOtp(body: {email: string, otp: string}, otp: string): Promise<{ message: string }> {
      const account = await this.accountService.findByEmail(body.email, false);
      if (!account) {
         this.authError.throw(ErrorCode.ACCOUNT_NOT_FOUND);
      }
         const storedOtp = await this.redisService.get<string>(`${RedisKeys.OTP}:${body.email}`);
         if (!storedOtp) {
            this.authError.throw(ErrorCode.OTP_EXPIRED);
         }
         console.log(storedOtp,otp)
         if (storedOtp.toString() !== otp) {
            this.authError.throw(ErrorCode.INVALID_OTP);
         }
         account.isVerified = true;
         await account.save()
         await this.redisService.del([`${RedisKeys.OTP}:${body.email}`]);

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

   async refreshToken(refreshTokenFromCookie: string, res: Response) {
      let payload: IRefreshToken;

      try {
         payload = this.jwtService.verify(refreshTokenFromCookie, {
            secret: this.environmentService.get("jwt.jwtRefreshSecret")
         });
      } catch (error) {
         this.clearAuthCookies(res);
         this.authError.throw(ErrorCode.INVALID_TOKEN);
      }

      const refreshRedisToken = await this.redisService.get<string>(NewRedisKeys.REFRESH_TOKEN(payload.userId, payload.jti))
      if (!refreshRedisToken) {
         this.clearAuthCookies(res);
         this.authError.throw(ErrorCode.REFRESH_TOKEN_NOT_IN_REDIS);
      }

      const decodeToken: IRefreshToken = await this.jwtService.decode(refreshRedisToken);
      if (decodeToken.jti !== payload.jti) {
         await this.redisService.del([NewRedisKeys.REFRESH_TOKEN(payload.userId, payload.jti)])
         this.clearAuthCookies(res);
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
         jti: jwtId
      }

      const accessToken = this.jwtService.sign(userPayload);
      const newRefreshToken = this.jwtService.sign(refresh, {
         jwtid: jwtId,
         secret: this.environmentService.get("jwt.jwtRefreshSecret"),
         expiresIn: this.environmentService.get("jwt.jwtExpiredRefresh")
      });

      // Delete old refresh token and store new one
      await this.redisService.del([NewRedisKeys.REFRESH_TOKEN(payload.userId, payload.jti)])
      await this.redisService.set(
         NewRedisKeys.REFRESH_TOKEN(user._id.toString(), jwtId),
         newRefreshToken,
         RedisTTL.REFRESH_TOKEN
      );

      // Set new tokens as cookies
      this.setAuthCookies(res, accessToken, newRefreshToken);

      return {
         user: {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            accountRole: user.accountRole,
            isVerified: user.isVerified
         }
      };
   }

   async logOut(refreshTokenFromCookie: string, res: Response) {
      let payload: IRefreshToken;

      try {
         payload = this.jwtService.verify(refreshTokenFromCookie, {
            secret: this.environmentService.get("jwt.jwtRefreshSecret")
         });
      } catch (error) {
         // Token is invalid, just clear cookies
         this.clearAuthCookies(res);
         return { message: 'Logged out successfully' };
      }

      const refreshRedisToken = await this.redisService.get<string>(NewRedisKeys.REFRESH_TOKEN(payload.userId, payload.jti))
      if (refreshRedisToken) {
         // Delete the refresh token from Redis
         await this.redisService.del([NewRedisKeys.REFRESH_TOKEN(payload.userId, payload.jti)])
      }

      // Clear all authentication cookies
      this.clearAuthCookies(res);

      return { message: 'Logged out successfully' };
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

   private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
      const isProduction = this.environmentService.get('app.env') === 'production';

      // Set access token cookie
      res.cookie('accessToken', accessToken, {
         httpOnly: true,
         secure: isProduction,
         sameSite: isProduction ? 'strict' : 'lax',
         maxAge: 15 * 60 * 1000, // 15 minutes
         path: '/'
      });

      // Set refresh token cookie
      res.cookie('refreshToken', refreshToken, {
         httpOnly: true,
         secure: isProduction,
         sameSite: isProduction ? 'strict' : 'lax',
         maxAge: RedisTTL.REFRESH_TOKEN * 1000, // 7 days
         path: '/'
      });
   }

   private clearAuthCookies(res: Response): void {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.clearCookie('sessionToken');
      res.clearCookie('otpToken');
      res.clearCookie('registrationToken');
   }
}
