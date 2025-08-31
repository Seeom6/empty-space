import { MongoId } from "@Package/utilities";
import { ProjectPriority, ProjectStatus } from "../types";
import { Employee } from "@Modules/account/account/data/schemas/employee.schems";
import { Technology } from "@Modules/technology/data";

export interface IProject {
    _id?: MongoId
    name: string;
    status: ProjectStatus;
    description: string;
    priority: ProjectPriority;
    progress: number;
    budget: number;
    endDate: Date;
    startDate: Date;
    deadline: Date;
    members: (MongoId | Employee)[];
    manger: MongoId | Employee;
    technology: (MongoId | Technology)[];
    tags: string[]
}