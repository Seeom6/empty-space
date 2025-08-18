import { ErrorCode } from "@Common/error";
import { Injectable } from "@nestjs/common";
import { ErrorMessages, IServiceError } from "@Package/error";

const errorMessage: ErrorMessages = {
    [ErrorCode.DEPARTMENT_NOT_FOUND]: "Department not found",
    [ErrorCode.DEPARTMENT_EXIST]: "Department already exists",
}
@Injectable()
export class DepartmentError extends IServiceError {
    constructor (){
        super(errorMessage, "DEPARTMENT_ERROR")
    }
}
