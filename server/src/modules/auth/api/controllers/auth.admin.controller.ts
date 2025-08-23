import { AuthAdminService } from "@Modules/auth/services/auth.admin.service";
import { Body, Post, Res } from "@nestjs/common";
import { LogInDto } from "../dto/request/logIn.dto";
import { Controller } from "@nestjs/common";
import { Response } from "express"

@Controller("admin/auth")
export class AuthAdminController {
    constructor(private readonly authAdminService: AuthAdminService) { }
    @Post("login")
    async login(@Body() body: LogInDto,@Res({passthrough: true}) res: Response) {
        const data = await this.authAdminService.login(body);
        res.cookie("accessToken",data.access_token)
        return data
    }
}