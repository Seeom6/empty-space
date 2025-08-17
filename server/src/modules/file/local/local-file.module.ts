import { LocalFileError } from "./services";
import { RedisService } from "@Infrastructure/cache";
import { JwtModule } from "@nestjs/jwt";
import { LocalFileService } from "./services";

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LocalFileRepository } from "./data/local-file.repository";
import { LocalFileController } from "./api/controllers";
import { LocalFileUnAuthenticatedController } from "./api/controllers/local-file.controller";
import { FileUrlService } from "@Package/file";
import { JwtAuthGuard, JwtStrategy } from "@Package/auth";
import { LocalFile, LocalFileSchema } from "@Infrastructure/database";

@Module({
  controllers: [LocalFileController, LocalFileUnAuthenticatedController],
  providers: [
    LocalFileRepository,
    LocalFileService,
    LocalFileError,
    FileUrlService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  imports: [
    MongooseModule.forFeature([
      {
        name: LocalFile.name,
        schema: LocalFileSchema,
      },
    ]),
    JwtModule,
  ],
  exports: [LocalFileService],
})
export class LocalFileModule {}
