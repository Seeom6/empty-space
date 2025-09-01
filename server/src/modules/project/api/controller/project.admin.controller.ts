import { ProjectAdminService } from "@Modules/project/service";
import {AdminController, queryParser} from "@Package/api";
import {CreateProjectDto, CreateProjectValidator} from "../dto/create-project.dto";
import {Body, Get, Param, Post, Query} from "@nestjs/common";
import {GetAllProjectDto, GetAllProjectValidator} from "@Modules/project/api/dto/get-all-project.dto";
import {GetAllProjectResponseDto} from "@Modules/project/api/dto/response/get-all-porject.reponse.dto";


@AdminController({
    prefix: "project",
})
export class ProjectAdminController {
    constructor(
        private readonly projectService: ProjectAdminService
    ){}

    @Post()
    async create(
        @Body(CreateProjectValidator) body: CreateProjectDto
    ){
      await this.projectService.createProject(body)
    }

    @Get()
  async  findAll(
    @Query(GetAllProjectValidator) query: GetAllProjectDto
    ){
      const {pagination, myQuery} = queryParser(query);
    const data =  await this.projectService.findAll(myQuery, pagination)
      return {
       totalRecord: data.totalRecord,
      data: GetAllProjectResponseDto(data.data),
      }
  }

  @Get(":id")
  async getById(
    @Param("id") id: string,
  ){
      const project = await this.projectService.getById(id)
    return project;
  }
}