import * as cookieParser from "cookie-parser"
import { EnvironmentService } from "@Infrastructure/config"
import { RedisService } from "@Infrastructure/cache"
import { NestExpressApplication } from "@nestjs/platform-express"
import * as morgan from "morgan"
export const nestConfig = async (app: NestExpressApplication, envService: EnvironmentService) => {
    app.enableCors({
        origin: "*",
        credentials: true,
    })
    app.use(cookieParser())
    app.use(morgan("dev"))
    app.setGlobalPrefix(`api/v${envService.get("app.version")}`)
    const redisService = app.get(RedisService)
    await redisService.connect()
}