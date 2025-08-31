import { BaseMongoRepository } from "@Infrastructure/database"
import { Project, ProjectDocument } from "./project.schema"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Injectable } from "@nestjs/common"

@Injectable()
export class ProjectRepository extends BaseMongoRepository<Project> {
    constructor(
        @InjectModel(Project.name) private readonly model: Model<ProjectDocument>
    ){
        super(model)
    }
}