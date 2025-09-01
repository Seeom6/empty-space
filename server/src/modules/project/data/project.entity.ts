import { MongoId } from "@Package/utilities";
import { ProjectPriority, ProjectStatus } from "../types";
import { Employee } from "@Modules/account/account/data/schemas/employee.schems";
import { Technology } from "@Modules/technology/data";
import {Account} from "@Modules/account/account/data";

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
    members: (MongoId | Account)[];
    manger: MongoId | Account;
    technology: (MongoId | Technology)[];
    tags: string[]
}