import { PositionDocument } from "@Modules/position/data";
import { MongoId } from "@Package/utilities";
import { DepartmentDocument } from "@Modules/department/data/department.schema";
import { TechnologyDocument } from "@Modules/technology/data";

export interface IEmployee {

    image?: string;
    department: MongoId | DepartmentDocument;
    position: MongoId | PositionDocument;
    technologies: MongoId[] | TechnologyDocument[];
    employmentType: string
    baseSalary?: number;
}
