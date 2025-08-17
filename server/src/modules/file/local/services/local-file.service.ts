import { InjectConnection } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import { join } from "path";
import { LocalFileRepository } from "../data/local-file.repository";
import { LocalFileError } from "./local-file.error";
import { storageFileKeys } from "../../../shared/config/file/file";
import { FileUrlService } from "@Package/file/services/usl.service";
import { LocalFile } from "@Infrastructure/database";
import { ErrorCode } from "@Common/error";
import { IParamsId } from "@Package/api";
import { getEnvService } from "@Infrastructure/config";
@Injectable()
export class LocalFileService {
  constructor(
    private readonly localFileRepository: LocalFileRepository,

    private readonly fileUrlService: FileUrlService,

    private readonly localFileError: LocalFileError,

    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create({ file, key }) {
    const originalFilename: string = decodeURIComponent(file.originalname);
    const originalname = originalFilename.split(".");
    const fileExtension: string = originalname[originalname.length - 1];
    const doc: LocalFile = {
      key,
      originalFilename,
      mimetype: file.mimetype,
      filename: file.filename,
      relativePath: file.path,
      extension: fileExtension,
    };
    const id = (await this.localFileRepository.create({
      doc,
    }));
    const fileUrl = this.fileUrlService.generate({
      storageFilePath: storageFileKeys[key],
      filename: file?.filename,
    });
    return { id, fileUrl };
  }

  //delete localFile
  async remove({ id }: { id: string }) {
    try {
      const env = getEnvService();
      const session = await this.connection.startSession();
      await session.withTransaction(async (session) => {
        const result = await this.localFileRepository.findByIdAndUpdate({
          id,
          update: { isDeleted: true },
          options: { session },
          error: this.localFileError.error(ErrorCode.FILE_NOT_FOUND),
        });
        const baseFilePath = env.get("app.baseUrl");
        const filePath = storageFileKeys[result.key];
        const fullFilePath = join(baseFilePath, filePath, result.filename);

        // See if the file exists
        if (fs.existsSync(fullFilePath)) {
          fs.unlinkSync(fullFilePath);
        }
      });
    } catch (error) {
      console.log(this.localFileError.error(ErrorCode.FILE_NOT_FOUND));
    }
    return;
  }

  async findOne({ id }: IParamsId) {
    const result = await this.localFileRepository.findById({
      id,
      error: this.localFileError.error(ErrorCode.FILE_NOT_FOUND),
    });
    return result;
  }

  metadata() {
    return { keys: Object.keys(storageFileKeys) };
  }

  getPath(filePath: string, filename: string): string {
    const env = getEnvService();
    const baseFilePath = env.get("app.baseUrl");
    return join(baseFilePath, filePath, filename);
  }
}
