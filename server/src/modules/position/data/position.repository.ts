import { BaseMongoRepository } from "@Infrastructure/database";
import { Position, PositionDocument } from "./position.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PositionRepo extends BaseMongoRepository<PositionDocument>{
    constructor(
        @InjectModel(Position.name) model: Model<PositionDocument>
    ){
        super(model)
    }
}