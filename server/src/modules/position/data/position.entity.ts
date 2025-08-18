import { DepartmentDocument } from "@Modules/department/data/department.schema";
import { MongoId } from "@Package/utilities";


export interface IPosition{
    _id?: string;
    name: string;
    departmentId: MongoId | DepartmentDocument;
    description?: string;
    status?: string;
    isDeleted?: boolean;
}