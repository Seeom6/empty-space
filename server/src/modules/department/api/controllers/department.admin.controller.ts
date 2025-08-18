import { DepartmentAdminService } from "@Modules/department/services";
import { Get, Post, Put, Delete, Param, Body } from "@nestjs/common";
import { AdminController } from "@Package/api";
import { CreateDepartmentDto } from "@Modules/department/api/dto";
import { UpdateDepartmentDto } from "@Modules/department/api/dto";
import { CreateDepartmentDtoValidator } from "@Modules/department/api/dto";
import { UpdateDepartmentDtoValidator } from "@Modules/department/api/dto";

@AdminController({
    prefix : "department",
})
export class DepartmentAdminController {
    constructor(
        private readonly departmentAdminService: DepartmentAdminService,
    ){
    }

    @Get()
    findAll(){
        return this.departmentAdminService.findAll();
    }

    @Get("/:id")
    findOne(@Param("id") id: string){
        return this.departmentAdminService.findOne({id});
    }

    @Post()
    create(@Body(CreateDepartmentDtoValidator) body: CreateDepartmentDto){
        return this.departmentAdminService.create(body);
    }

    @Put("/:id")
    update(@Param("id") id: string, @Body(UpdateDepartmentDtoValidator) body: UpdateDepartmentDto){
        return this.departmentAdminService.update({id}, body);
    }

    @Delete("/:id")
    remove(@Param("id") id: string){
        return this.departmentAdminService.remove({id});
    }
}