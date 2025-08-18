import { Injectable } from "@nestjs/common";
import { ErrorMessages, IServiceError } from "@Package/error";
import { ErrorCode } from "@Common/error";

const errorMessage: ErrorMessages = {
    [ErrorCode.EMPLOYEE_NOT_FOUND]: "Employee not found",
    [ErrorCode.EMPLOYEE_EXIST]: "Employee already exists",
}
@Injectable()
export class EmployeeError extends IServiceError {
    constructor() {
        super(errorMessage, "EMPLOYEE_ERROR")
    }
}   