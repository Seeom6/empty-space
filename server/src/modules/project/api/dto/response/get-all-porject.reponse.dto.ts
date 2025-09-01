import {ProjectDocument} from "@Modules/project/data";
import {Account} from "@Modules/account/account/data";
import {Technology} from "@Modules/technology/data";


export function  GetAllProjectResponseDto(projects: ProjectDocument[]) {
  return projects.map(project =>
  {
    return {
      id: project._id,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      endDate: project.endDate,
      members: project.members.length,
      progress: project.progress,
      budget: project.budget,
      technology: project.technology.map((t: Technology)=> t.name),
      manger: (project.manger as Account).firstName + " " + (project.manger as Account).lastName,
    }
  })
}