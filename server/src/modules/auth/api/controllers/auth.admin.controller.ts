import { AuthAdminService } from "@Modules/auth/services/auth.admin.service";
import { Body, Post, Res, UseGuards } from "@nestjs/common";
import { LogInDto } from "../dto/request/logIn.dto";
import { Controller } from "@nestjs/common";
import { Response } from "express"
import { RegisterEmployeeDto, RegisterEmployeeValidator, SendOtpDto } from "../dto/request";
import { Account, AccountPayload, AdminController } from "@Package/api";
import { JwtAuthGuard } from "@Package/auth";

@Controller("admin/auth")
export class AuthAdminController {
    constructor(private readonly authAdminService: AuthAdminService) { }
    @Post("login")
    async login(@Body() body: LogInDto,@Res({passthrough: true}) res: Response) {
        const data = await this.authAdminService.login(body);
        res.cookie("accessToken",data.access_token)
        return data
    }

    @Post("send-otp")
    async sendOtp(@Body() body: SendOtpDto){
        const data = await this.authAdminService.sendOtp(body)
        return {data}
    }
} 

@UseGuards(JwtAuthGuard)
@Controller("admin/auth")
export class AuthAdminControllerWithToken {
    constructor(private readonly authAdminService: AuthAdminService) { }
    @Post("verify-otp")
    async verifyOtp(@Account() user: {email: string, otp: string}, @Body() body: { otp: string }) {
        return await this.authAdminService.verifyOtp(user, body.otp);
    }

    @Post("register")
    async register(
        @Body(RegisterEmployeeValidator) body: RegisterEmployeeDto,
        @Account() user: {email: string, status: boolean}
    ){
        const data = await this.authAdminService.registerEmployee(body, user)
        return {data}
    }
}