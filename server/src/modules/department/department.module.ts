import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Department, DepartmentSchema } from "./data/department.schema";
import { DepartmentAdminService } from "./services/department.admin.service";
import { DepartmentError } from "./services/department.error";
import { DepartmentRepo } from "./data/department.repository";
import { CreateDepartmentDtoValidator, UpdateDepartmentDtoValidator } from "./api/dto";
import { DepartmentAdminController } from "./api/controllers/department.admin.controller";

@Module({
    imports:[
        MongooseModule.forFeature([
            { name: Department.name, schema: DepartmentSchema },
        ]),
    ],
    controllers:[DepartmentAdminController],
    providers:[
        DepartmentError,
        DepartmentAdminService,
        DepartmentRepo,
        CreateDepartmentDtoValidator,
        UpdateDepartmentDtoValidator,
    ],
    exports:[DepartmentAdminService]
})
export class DepartmentModule {

}