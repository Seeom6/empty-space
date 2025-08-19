import { DepartmentDocument } from "@Modules/department/data/department.schema";


export function getAllDepartmentDto(departments: DepartmentDocument[]){
    return departments.map((department) => {
        return {
            id: department._id,
            name: department.name,
            description: department.description,
            status: department.status,
        }
    })
}