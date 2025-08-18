import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IPosition } from "./position.entity";
import { PositionStatus } from "../types/position-status.type";
import { Department, DepartmentDocument } from "@Modules/department/data/department.schema";
import { MongoId } from "@Package/utilities";
import { VDocument } from "@Infrastructure/database";

export type PositionDocument = VDocument<IPosition>

@Schema()
export class Position implements IPosition{
    @Prop({required:true,ref:Department.name})
    departmentId: MongoId | DepartmentDocument;
    _id?: string;
    @Prop({required:true})
    name: string;
    @Prop()
    description?: string;
    @Prop({default:PositionStatus.ACTIVE})
    status?: string;
    @Prop({default:false})
    isDeleted?: boolean;
}

export const PositionSchema = SchemaFactory.createForClass(Position)
