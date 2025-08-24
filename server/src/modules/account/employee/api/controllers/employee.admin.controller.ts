import { Get, Post, Put, Delete, Query } from "@nestjs/common";
import { AdminController } from "@Package/api";
import { Param, Body } from "@nestjs/common";
import { EmployeeAdminService } from "../../services/employee.admin.service";
import { CreateEmployeeDtoValidator } from "../../api/dto";
import { UpdateEmployeeDtoValidator } from "../../api/dto";
import { CreateEmployeeDto } from "../../api/dto";
import { UpdateEmployeeDto } from "../../api/dto";
import { UpdateEmployeePasswordDtoValidator } from "../../api/dto";
import { UpdateEmployeePasswordDto } from "../../api/dto";
import { getAllEmployeeDto } from "../dto/response";
import { GetAllEmployeeDto, GetAllEmployeeDtoValidator } from "../dto/get-all-employee.dto";
import { queryParser } from "@Package/api";
import { getEmployeeByIdDto } from "../dto/response/get-employee-by-id.dto";

@AdminController({
    prefix: "employee",
})
export class EmployeeAdminController {
    constructor(
        private readonly employeeAdminService: EmployeeAdminService,
    ){
    }

    @Get()
    async findAll(@Query(GetAllEmployeeDtoValidator) query: GetAllEmployeeDto){
        const {pagination, myQuery } = queryParser(query)
        const employees = await this.employeeAdminService.findAll(pagination, myQuery);
        return {
            totalCount: employees.totalCount,
            data: getAllEmployeeDto(employees.data)
        }
    }

    @Get("/:id")
    async findOne(@Param("id") id: string){
        const employee = await this.employeeAdminService.findOne({id});
        return getEmployeeByIdDto(employee);
    }

    @Post()
    create(@Body(CreateEmployeeDtoValidator) body: CreateEmployeeDto){
        return this.employeeAdminService.create(body);
    }

    @Put("/:id")
    update(@Param("id") id: string, @Body(UpdateEmployeeDtoValidator) body: UpdateEmployeeDto){
        return this.employeeAdminService.update({id}, body);
    }

    @Delete("/:id")
    remove(@Param("id") id: string){
        return this.employeeAdminService.remove({id});
    }

    @Put("/:id/password")
    updatePassword(@Param("id") id: string, @Body(UpdateEmployeePasswordDtoValidator) body: UpdateEmployeePasswordDto){
        return this.employeeAdminService.updatePassword({id}, body);
    }
}