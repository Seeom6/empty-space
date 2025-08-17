
import { createParamDecorator, ExecutionContext } from "@nestjs/common";


export const Headers = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    request.headers.languageKey = request.headers["accept-language"] ;
    request.headers.countryCode = request.headers["country-code"]
    request.headers.xApiKey = request.headers["x-api-key"]
    return request.headers;
  },
);