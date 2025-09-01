import { Injectable } from "@nestjs/common";
import { IProject, ProjectRepository } from "../data";
import { CreateProjectDto } from "@Modules/project/api/dto";
import { TechnologyServiceAdmin } from "@Modules/technology/service";
import { EmployeeService } from "@Modules/account/account/services/employee.service";
import { toMongoId } from "@Package/utilities";
import {Pagination, QueryValue} from "@Package/api";
import {GetAllProjectDto} from "@Modules/project/api/dto/get-all-project.dto";


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

    async  findAll(
      query: QueryValue<GetAllProjectDto>,
      pagination: Pagination
    ){
      console.log(pagination)
        const [data, totalRecord] = await Promise.all([
          this.projectRepository.find(
            {filter:{...query},
              options:{
                populate:[{path:"manger"}, {path:"technology"}],
                skip: pagination.skip,
                limit: pagination.limit
              }}),
          this.projectRepository.countDocuments({filter: {...query}})
        ])
      return {totalRecord,data}
    }

    async getById(id: string){
        return await this.projectRepository.findOne({
          filter:{_id: toMongoId(id)},
          options:{populate:[
            {path:"manger",populate: [{path: "employee.position"}]},
              {path:"technology"},
              {path:"members", populate: [{path: "employee.position"}]}
            ]}
        })
    }
}