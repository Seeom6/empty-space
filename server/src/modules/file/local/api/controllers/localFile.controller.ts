import { CreateLocalFile } from "../dto";
import { FileInterceptor } from "@nestjs/platform-express";
// import { ResponseData } from '../../../dto';
import { Express } from "express";

import { LocalFileService, localFileStorage } from "../../services";

import { Get, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { AuthWebController } from "@Package/api";
import { CreateFileValidation } from "../validation/create-file.validation";
@AuthWebController({
  prefix: "localFile",
})
export class LocalFileController {
  // call localFile service in constructor
  constructor(
    private readonly localFileService: LocalFileService,
  ) {}

  // ######################### Create new localFile Api #########################
  @UseInterceptors(FileInterceptor("file", { storage: localFileStorage }))
  @Post("uploadLocalFile/:key")
  async create(
    @Param(CreateFileValidation) param: CreateLocalFile,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.localFileService.create({
      file,
      key: param.key,
    });
  }

  //######################### Delete localFile Api #########################
  // //swagger
  // @  DefaultSwaggerDelete({ feature: 'localFile' })
  // //api
  // @Delete('deleteLocalFile/:id')
  // async remove(@Param(validation.id) { id }: { id: string }) {
  //   return await this.localFileService.remove(id);
  // }

  //######################### Get Metadata Api #########################
  // api
  @Get("/metadata")
  metaData() {
    return this.localFileService.metadata();
  }
}
