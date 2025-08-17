import { CanActivate, ExecutionContext, HttpStatus, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express"
import { CustomHeaders } from "../types";
import { EnvironmentService } from "@Infrastructure/config";
import { AppError } from "@Package/error";
import { ErrorCode } from "@Common/error";

@Injectable()
export class APIKeyGuard implements CanActivate {
    constructor(
        private readonly env: EnvironmentService
    ){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest()
        const apiKey = request.headers[CustomHeaders.AppAPIKey]
        const myApiKey = this.env.get("app.appApiKey")
        if(myApiKey !== apiKey){
            throw new AppError({
                code: ErrorCode.INVALID_API_KEY,
                message: "invalid api key",
                statusCode: HttpStatus.FORBIDDEN,
                errorType: "Auth Error"
            })
        }
        return true
    }
    
}