import { TechnologyServiceAdmin } from "@Modules/technology/service";
import { AdminController, AllowRole, IParamsId } from "@Package/api";
import { CreateTechnologyRequestDto, UpdateTechnologyRequestDto } from "../dto";
import { Body, Param } from "@nestjs/common";
import { CreateTechnologyValidation } from "../dto/create-technology.dto";
import { UpdateTechnologyValidation } from "../dto/update-technology.dto";
import { Get, Post, Put, Delete } from "@nestjs/common";
import { AccountRole } from "@Modules/account/account/types/role.enum";
import { getAllTechnologyDto } from "../dto/response/get-all.dto";
import { getTechnologyDto } from "../dto/response/get-by-id.dto";


@AdminController({
    prefix: "technology"
})
export class TechnologyAdminController {
    constructor(
        private readonly technologyService: TechnologyServiceAdmin
    ){}

    @AllowRole(AccountRole.SUPER_ADMIN)
    @Get()
    async home(){
        return await this.technologyService.home();
    }
    @AllowRole(AccountRole.SUPER_ADMIN)
    @Get("/all")
    async findAll(){
        const technology = await this.technologyService.findAll();
        return getAllTechnologyDto(technology)
    }



    @AllowRole(AccountRole.SUPER_ADMIN)
    @Get("/:id")
    async findOne(@Param() paramsId: IParamsId){
        const technology = await this.technologyService.findOne(paramsId);
        return getTechnologyDto(technology);
    }

    @AllowRole(AccountRole.SUPER_ADMIN)
    @Post()
    async create(@Body(CreateTechnologyValidation) body: CreateTechnologyRequestDto){
        return await this.technologyService.create(body);
    }

    @AllowRole(AccountRole.SUPER_ADMIN)
    @Put()
    async update(@Param() paramsId: IParamsId, @Body(UpdateTechnologyValidation) body: UpdateTechnologyRequestDto){
        return await this.technologyService.update(paramsId, body);
    }

    @AllowRole(AccountRole.SUPER_ADMIN)
    @Delete()
    async remove(@Param() paramsId: IParamsId){
        return await this.technologyService.remove(paramsId);
    }
}