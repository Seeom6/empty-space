import { BaseMongoRepository } from "@Infrastructure/database";
import { Department, DepartmentDocument } from "./department.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


export class DepartmentRepo extends BaseMongoRepository<DepartmentDocument>{
    constructor(
        @InjectModel(Department.name) model: Model<DepartmentDocument>
    ){
        super(model)
    }
}   