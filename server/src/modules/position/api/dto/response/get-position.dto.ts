import { PositionDocument } from "@Modules/position/data/position.schema";
import { DepartmentDocument } from "@Modules/department/data/department.schema";

export function getPositionDto(position: PositionDocument){
    return {
        id: position._id,
        name: position.name,
        description: position.description,
        status: position.status,
        department: (position?.departmentId as DepartmentDocument)?.name,
    }
}