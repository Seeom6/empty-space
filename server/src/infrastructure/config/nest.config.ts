import * as cookieParser from "cookie-parser"
import { EnvironmentService } from "@Infrastructure/config"
import { RedisService } from "@Infrastructure/cache"
import { NestExpressApplication } from "@nestjs/platform-express"
import * as morgan from "morgan"
import * as cors from "cors"
export const nestConfig = async (app: NestExpressApplication, envService: EnvironmentService) => {
    app.use(cookieParser());
    app.use(morgan("dev"));
    app.setGlobalPrefix(`api/v${envService.get("app.version")}`);

    app.enableCors({
      origin: process.env.NODE_ENV === 'production'
        ? (process.env.ALLOWED_ORIGINS?.split(',') || [])
        : [
            "http://localhost:3000", // client frontend
            "http://localhost:3001", // dashboard frontend (if different port)
            "http://127.0.0.1:3000", // alternative localhost
            "http://127.0.0.1:3001"  // alternative localhost
          ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-CSRF-Token',
        'X-Requested-With'
      ],
      exposedHeaders: ['X-CSRF-Token'],
    });

    // Redis connection is handled in RedisService.onModuleInit()
    // No need to connect again here
};