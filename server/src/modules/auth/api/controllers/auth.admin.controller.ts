import { AuthAdminService } from "@Modules/auth/services/auth.admin.service";
import { Body, Post } from "@nestjs/common";
import { LogInDto } from "../dto/request/logIn.dto";
import { Controller } from "@nestjs/common";

@Controller("admin/auth")
export class AuthAdminController {
    constructor(private readonly authAdminService: AuthAdminService) { }
    @Post("login")
    login(@Body() body: LogInDto) {
        return this.authAdminService.login(body);
    }
}