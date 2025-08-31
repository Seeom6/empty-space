import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Project, ProjectRepository, ProjectSchema } from "./data";
import { ProjectAdminService } from "./service";


@Module({
    imports: [
        MongooseModule.forFeature([{
            name: Project.name,
            schema: ProjectSchema
        }])
    ],
    providers: [ProjectRepository, ProjectAdminService],
    exports:  [ProjectAdminService]
})
export class ProjectModule {}