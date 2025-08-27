import { InjectConnection } from "@nestjs/mongoose";
import { LogInDto } from "../api/dto/request/logIn.dto";
import { Injectable } from "@nestjs/common";
import { Connection } from "mongoose";
import { AuthError } from "./auth.error";
import { JwtService } from "@nestjs/jwt";
import { ErrorCode } from "../../../common/error/error-code";
import { AccountService } from "@Modules/account/account/services";
import { AccountRole } from "@Modules/account/account/types/role.enum";
import { RedisService } from "@Infrastructure/cache";
import { MailService } from "@Package/services";
import { AccountPayload } from "@Package/api";
import { RegisterEmployeeDto, SendOtpDto } from "../api/dto/request";
import { InviteCodeAdminService } from "@Modules/invite-code/services";
import { Employee } from "@Modules/account/account/data/schemas/employee.schems";
import { Account, AccountRepository } from "@Modules/account/account/data";
import { EmployeeStatus, EmploymentType } from "@Modules/account/employee/types";
import { InviteCodeStatus } from "@Modules/invite-code/types";
import { InjectQueue } from "@nestjs/bullmq";
import { QueuesNames } from "@Infrastructure/queue";
import { Queue } from "bullmq";
import { generateOTP } from "@Package/utilities";
import { RedisKeys } from "@Common/cache";
import { EnvironmentService } from "@Infrastructure/config";

@Injectable()
export class AuthAdminService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly accountService: AccountService,
        private readonly authError: AuthError,
        private readonly redisService: RedisService,
        private readonly accountRepository: AccountRepository,
        private readonly inviteCodeService: InviteCodeAdminService,
        private readonly environmentService: EnvironmentService,
        @InjectQueue(QueuesNames.MAIL) private readonly emailQueue: Queue,
        @InjectConnection() private readonly connection: Connection
    ) { }

    async login(body: LogInDto) {
        const user = await this.accountService.findByEmail(body.email, false);
        if (!user) {
            this.authError.throw(ErrorCode.INVALID_CREDENTIALS);
        }

        if (![AccountRole.SUPER_ADMIN, AccountRole.EMPLOYEE, AccountRole.OPERATOR, AccountRole.ADMIN].includes(user.accountRole)) {
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

    async registerEmployee(body: RegisterEmployeeDto) {
        const inviteCode = await this.inviteCodeService.checkInviteCodeForRegister(body.inviteCode)
        if (!inviteCode) this.authError.throw(ErrorCode.INVITE_CODE_NOT_FOUND)
        if(inviteCode.status === InviteCodeStatus.USED) this.authError.throw(ErrorCode.INVITE_CODE_USED)
        const [isExist, isPhoneNumberExist] = await Promise.all([
            this.accountService.findByEmail(body.email, false),
            this.accountService.findByPhone(body.phoneNumber, false)
        ])
        if (isExist) this.authError.throw(ErrorCode.USER_ALREADY_EXISTS)
        // if(isPhoneNumberExist) this.authError.throw(ErrorCode.ACCOUNT_ALREADY_EXISTS)
        const employee: Employee = {
            inviteCode: inviteCode.code,
            position: inviteCode.position._id,
            department: inviteCode.position["departmentId"],
            image: "",
            employmentType: EmploymentType.FULL_TIME,
            technologies: [],
            status: EmployeeStatus.ACTIVE,
            hireDate: new Date(),
        }
        const account: Account = {
            email: body.email,
            phoneNumber: body.phoneNumber,
            password: body.password,
            firstName: body.firstName,
            lastName: body.lastName,
            employee,
            accountRole: AccountRole.EMPLOYEE,
            isActive: true,
            isVerified: false,
            birthday: body.birthday,
        }
        await this.accountRepository.create({
            doc: account,
        })
        await this.inviteCodeService.updateInviteCode({ status: InviteCodeStatus.USED, code: inviteCode.code })
        const otp = generateOTP(5)
        await this.emailQueue.add("send-verification-email", {
            email: body.email,
            otp: otp
        })
        console.log("pre sotre in redis ",otp)
        await this.redisService.set(`${RedisKeys.OTP}:${body.email}`, otp, 30000000);
        const otpToken = this.jwtService.sign({ email: body.email, otp: otp }, { secret: this.environmentService.get("jwt.jwtAccessSecret"), expiresIn: 3000000 });
        return otpToken
    }

    async sendOtp(body: SendOtpDto) {
        const otp = generateOTP();
        await this.redisService.set(`otp:${body.email}`, otp, 30000000);
        const otpToken = this.jwtService.sign({ email: body.email, otp: otp }, { secret: this.environmentService.get("jwt.jwtAccessSecret"), expiresIn: 3000000 });
        await this.emailQueue.add(QueuesNames.MAIL, {
            email: body.email,
            otp,
        })
        return otpToken
    }
}