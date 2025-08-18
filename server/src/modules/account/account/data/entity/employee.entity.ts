import { PositionDocument } from "@Modules/position/data";
import { MongoId } from "@Package/utilities";
import { DepartmentDocument } from "@Modules/department/data/department.schema";

export interface IEmployee {

    image: string;
    department: MongoId | DepartmentDocument;
    position: MongoId | PositionDocument;

    employmentType: string

    baseSalary: number;
}
