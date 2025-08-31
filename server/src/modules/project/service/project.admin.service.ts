import { Injectable } from "@nestjs/common";
import { IProject, ProjectRepository } from "../data";
import { CreateProjectDto } from "../api/dto/create-project.dto";
import { AccountService } from "@Modules/account/account/services";
import { TechnologyServiceAdmin } from "@Modules/technology/service";
import { EmployeeService } from "@Modules/account/account/services/employee.service";
import { ProjectStatus } from "../types";
import mongoose from "mongoose";
import { toMongoId } from "@Package/utilities";


@Injectable()
export class ProjectAdminService {
    constructor(
        private readonly projectRepository: ProjectRepository,
        private readonly employeeService: EmployeeService,
        private readonly technologyService: TechnologyServiceAdmin,
    ){}

    async createProject(body: CreateProjectDto){
        await Promise.all([
            this.technologyService.findAllByIds({ids: body.technology}),
            this.employeeService.findEmployeeByIds({ids: body.members})
        ])
        const project: IProject = {
            name: body.name,
            status: body.status,
            description: body.description,
            priority: body.priority,
            progress: 0,
            budget: body.budget,
            endDate: body.endDate,
            startDate: body.startDate,
            deadline: body.deadline ?? body.endDate,
            members: body.members.map((m)=> toMongoId(m)),
            manger: toMongoId(body.manger),
            technology: body.technology.map((m)=> toMongoId(m)),
            tags: body.tags
        }
        await this.projectRepository.create({
            doc: project
        })
    }
}