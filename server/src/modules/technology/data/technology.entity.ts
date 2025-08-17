import { TechnologyStatus } from "../types";


export interface ITechnology {
    name: string;
    version: string;
    icon: string;
    website: string;
    status: TechnologyStatus;
    description: string;
    category: string;
}