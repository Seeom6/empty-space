import {ProjectDocument} from "@Modules/project/data";
import {Technology} from "@Modules/technology/data";
import {Account} from "@Modules/account/account/data";
import {PositionDocument} from "@Modules/position/data";


export function GetProjectResponseDto(project: ProjectDocument) {
  return {
    overview: {
      members: project.members.length,
      progress: project.progress,
      budget: project.budget,
      technologies: project.technology.map((t:Technology)=> t.name)
    },
    team: {
      members:[
        {
          name: (project.manger as any).firstName + " " + (project.manger as any).lastName,
          position: ((project.manger as Account).employee.position as PositionDocument).name,
        },
        ...project.members.map((member: Account) => {
          return {
            name: member.firstName + " " + member.lastName,
            position: ((member.employee.position as PositionDocument).name),
          }
        })
      ]
    }
  }
}