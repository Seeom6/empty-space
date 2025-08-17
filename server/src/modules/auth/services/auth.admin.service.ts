import {InjectConnection} from "@nestjs/mongoose";
import {LogInDto} from "../api/dto/request/logIn.dto";
import {Injectable} from "@nestjs/common";
import {Connection} from "mongoose";
import {AuthError} from "./auth.error";
import {JwtService} from "@nestjs/jwt";
import {ErrorCode} from "../../../common/error/error-code";
import { AccountService } from "@Modules/account/account/services";
import { AccountRole } from "@Modules/account/account/types/role.enum";
import { RedisService } from "@Infrastructure/cache";
import { MailService } from "@Package/services";
import { AccountPayload } from "@Package/api";

@Injectable()
export class AuthAdminService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: AccountService,
        private readonly authError: AuthError,
        private readonly redisService: RedisService,
        private readonly mailService: MailService,
        @InjectConnection() private readonly connection: Connection
    ) { }

    async login(body: LogInDto) {
        const user = await this.userService.findByEmail(body.email, false);
        if (!user) {
            this.authError.throw(ErrorCode.INVALID_CREDENTIALS);
        }

        if (user.accountRole !== AccountRole.SUPER_ADMIN) {
            this.authError.throw(ErrorCode.INVALID_CREDENTIALS);
        }

        // const isPasswordValid = await HashService.comparePassword(
        //     body.password,
        //     user.password
        // );
        // if (!isPasswordValid) {
        //     this.authError.throw(ErrorCode.INVALID_CREDENTIALS);
        // }

        const userPayload: AccountPayload = {
            accountId: user._id.toString(),
            email: user.email,
            isActive: user.isActive,
            isVerified: user.isVerified,
            accountRole: user.accountRole,
        };

        const accessToken = this.jwtService.sign(userPayload);
        await Promise.all([
            this.redisService.set(`${user._id.toString()}`, accessToken),
            this.redisService.set(`${user._id.toString()}privileges`, []),
        ])
        return {
            access_token: accessToken,
        };
    }
}