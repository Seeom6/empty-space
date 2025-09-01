import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Project, ProjectRepository, ProjectSchema } from "./data";
import { ProjectAdminService } from "./service";
import {AccountModule} from "@Modules/account/account/account.module";
import {TechnologyModule} from "@Modules/technology/technology.module";
import {EmployeeModule} from "@Modules/account/employee/employee.module";
import {ProjectAdminController} from "@Modules/project/api/controller/project.admin.controller";


@Module({
    imports: [
        MongooseModule.forFeature([{
            name: Project.name,
            schema: ProjectSchema
        }]),
      AccountModule,
      EmployeeModule,
      TechnologyModule
    ],
  controllers:[ProjectAdminController],
    providers: [ProjectRepository, ProjectAdminService],
    exports:  [ProjectAdminService]
})
export class ProjectModule {}