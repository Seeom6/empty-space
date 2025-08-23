import { BaseMongoRepository } from "@Infrastructure/database";
import { InviteCode, InviteCodeDocument } from "./invite-code.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class InviteCodeRepo extends BaseMongoRepository<InviteCode> {
    constructor(
        @InjectModel(InviteCode.name) private readonly model: Model<InviteCodeDocument>
    ){
        super(model)
    }
}