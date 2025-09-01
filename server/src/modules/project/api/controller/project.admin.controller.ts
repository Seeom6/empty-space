import { ProjectAdminService } from "@Modules/project/service";
import { AdminController } from "@Package/api";
import { CreateProjectDto } from "../dto/create-project.dto";
import { Body, Post } from "@nestjs/common";


@AdminController({
    prefix: "project",
})
export class ProjectAdminController {
    constructor(
        private readonly projectService: ProjectAdminService
    ){}

    @Post()
    async create(
        @Body() body: CreateProjectDto
    ){
        
    }
}