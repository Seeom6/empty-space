import { ErrorCode } from "@Common/error";
import { Injectable } from "@nestjs/common";
import { ErrorMessages, IServiceError } from "@Package/error";

const errorMessage: ErrorMessages = {
    [ErrorCode.POSITION_NOT_FOUND]: "Position not found",
    [ErrorCode.POSITION_EXIST]: "Position already exists",
}
@Injectable()
export class PositionError extends IServiceError {
    constructor() {
        super(errorMessage, "POSITION_ERROR")
    }
}