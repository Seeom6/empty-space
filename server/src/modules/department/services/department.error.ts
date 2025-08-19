import { ErrorCode } from "@Common/error";
import { Injectable } from "@nestjs/common";
import { ErrorMessages, IServiceError } from "@Package/error";

const errorMessage: ErrorMessages = {
    [ErrorCode.DEPARTMENT_NOT_FOUND]: "Department not found",
    [ErrorCode.DEPARTMENT_EXIST]: "Department already exists",
    [ErrorCode.DEPARTMENT_HAS_POSITION]: "Department has position",
    [ErrorCode.DEPARTMENT_HAS_EMPLOYEE]: "Department has employee",
}
@Injectable()
export class DepartmentError extends IServiceError {
    constructor (){
        super(errorMessage, "DEPARTMENT_ERROR")
    }
}
