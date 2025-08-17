import { BaseMongoRepository } from "@Infrastructure/database";
import { ITechnology } from "./technology.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Technology, TechnologyDocument } from "./technology.schema";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";


@Injectable()
export class TechnologyRepo extends BaseMongoRepository<ITechnology> {
    constructor(
        @InjectModel(Technology.name) private model: Model<TechnologyDocument>
    ){
        super(model)
    }
}