import { ErrorCode } from "@Common/error";
import { Injectable } from "@nestjs/common";
import { ErrorMessages, IServiceError } from "@Package/error";


const errorMessage: ErrorMessages = {
    
}

@Injectable()
export class InviteCodeError extends IServiceError {
    constructor(){
        super(errorMessage, InviteCodeError.name)
    }
}