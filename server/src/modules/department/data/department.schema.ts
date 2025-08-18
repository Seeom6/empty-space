import { DepartmentStatus } from "../types/department-status.type";
import { IDepartment } from "./department.entity";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { VDocument } from "@Infrastructure/database";

export type DepartmentDocument = VDocument<IDepartment>

@Schema()
export class Department implements IDepartment{
    _id?: string;
    @Prop({required:true})
    name: string;
    @Prop()
    description?: string;
    @Prop({default:DepartmentStatus.ACTIVE})
    status?: string;
    @Prop({default:false})
    isDeleted?: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department)