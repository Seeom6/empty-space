import { Module } from "@nestjs/common";
import { DepartmentModule } from "@Modules/department/department.module";
import { PositionModule } from "@Modules/position/position.module";
import { EmployeeAdminController } from "./api/controllers/employee.admin.controller";
import { EmployeeAdminService } from "./services/employee.admin.service";
import { EmployeeError } from "./services/employee.error";
import { CreateEmployeeDtoValidator, UpdateEmployeeDtoValidator, UpdateEmployeePasswordDtoValidator } from "./api/dto";
import { AccountModule } from "../account/account.module";
@Module({
    imports:[
        DepartmentModule,
        PositionModule,
        AccountModule
    ],
    controllers:[EmployeeAdminController],
    providers:[
        EmployeeAdminService,
        EmployeeError,
        CreateEmployeeDtoValidator,
        UpdateEmployeeDtoValidator,
        UpdateEmployeePasswordDtoValidator,
    ],
    exports:[EmployeeAdminService]
})
export class EmployeeModule {
    
}