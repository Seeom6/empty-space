import { PositionAdminService } from "@Modules/position/services/position.admin.service";
import { AdminController } from "@Package/api";
import { Get, Post, Put, Delete, Param, Body } from "@nestjs/common";
import { CreatePositionDtoValidator } from "@Modules/position/api/dto";
import { UpdatePositionDtoValidator } from "@Modules/position/api/dto";
import { CreatePositionDto } from "@Modules/position/api/dto";
import { UpdatePositionDto } from "@Modules/position/api/dto";

@AdminController({
    prefix : "position",
})
export class PositionAdminController {
    constructor(
        private readonly positionAdminService: PositionAdminService,
    ){
    }

    @Get()
    findAll(){
        return this.positionAdminService.findAll();
    }

    @Get("/:id")
    findOne(@Param("id") id: string){
        return this.positionAdminService.findOne({id});
    }

    @Post()
    create(@Body(CreatePositionDtoValidator) body: CreatePositionDto){
        return this.positionAdminService.create(body);
    }

    @Put("/:id")
    update(@Param("id") id: string, @Body(UpdatePositionDtoValidator) body: UpdatePositionDto){
        return this.positionAdminService.update({id}, body);
    }

    @Delete("/:id")
    remove(@Param("id") id: string){
        return this.positionAdminService.remove({id});
    }
}
    