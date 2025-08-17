import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { BaseMongoRepository } from "@Infrastructure/database";
import { LocalFile, LocalFileDocument } from "@Infrastructure/database";

@Injectable()
export class LocalFileRepository extends BaseMongoRepository<LocalFile> {
  constructor(
    @InjectModel(LocalFile.name)
    localFileModel: Model<LocalFileDocument>,
  ) {
    super(localFileModel);
  }
}
