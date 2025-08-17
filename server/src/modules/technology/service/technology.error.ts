import { ErrorCode } from "@Common/error";
import { Injectable } from "@nestjs/common";
import { ErrorMessages, IServiceError } from "@Package/error";


const errorMessages: ErrorMessages = {
    [ErrorCode.TECHNOLOGY_NOT_FOUND] : "technology not found",
    [ErrorCode.TECHNOLOGY_EXIST] : "technology ealready exist before",
}

@Injectable()
export class TechnologyError extends IServiceError {
    constructor(){
        super(errorMessages, TechnologyError.name)
    }
}