import { DepartmentAdminService } from "@Modules/department/services";
import { Get, Post, Put, Delete, Param, Body } from "@nestjs/common";
import { AdminController } from "@Package/api";
import { CreateDepartmentDto } from "@Modules/department/api/dto";
import { UpdateDepartmentDto } from "@Modules/department/api/dto";
import { CreateDepartmentDtoValidator } from "@Modules/department/api/dto";
import { UpdateDepartmentDtoValidator } from "@Modules/department/api/dto";
import { getAllDepartmentDto } from "../dto/response";

@AdminController({
    prefix : "department",
})
export class DepartmentAdminController {
    constructor(
        private readonly departmentAdminService: DepartmentAdminService,
    ){
    }

    @Get()
    async findAll(){
        const departments = await this.departmentAdminService.findAll();
        return getAllDepartmentDto(departments);
    }

    @Get("/:id")
    async findOne(@Param("id") id: string){
        const department = await this.departmentAdminService.findOne({id});
        return department
    }

    @Post()
    async create(@Body(CreateDepartmentDtoValidator) body: CreateDepartmentDto){
        return this.departmentAdminService.create(body);
    }

    @Put("/:id")
    async update(@Param("id") id: string, @Body(UpdateDepartmentDtoValidator) body: UpdateDepartmentDto){
        await this.departmentAdminService.update({id}, body);
        return
    }

    @Delete("/:id")
    async remove(@Param("id") id: string){
        return this.departmentAdminService.remove({id});
    }
}