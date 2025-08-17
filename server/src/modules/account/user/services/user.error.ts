import { ErrorCode } from "@Common/error/error-code";
import { Injectable } from "@nestjs/common";
import { IServiceError } from "@Package/error";

const UserErrorMessages = {
    [ErrorCode.USER_NOT_FOUND]: 'User not found',
    [ErrorCode.USER_ALREADY_EXISTS]: 'User already exists',
};


@Injectable()
export class UserError extends IServiceError{

    constructor() {
        super(UserErrorMessages, 'USER_ERROR');
    }

}
