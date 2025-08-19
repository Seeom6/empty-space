import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IPosition } from "./position.entity";
import { PositionStatus } from "../types/position-status.type";
import { Department, DepartmentDocument } from "@Modules/department/data/department.schema";
import { MongoId } from "@Package/utilities";
import { VDocument } from "@Infrastructure/database";
import mongoose from "mongoose";

export type PositionDocument = VDocument<IPosition>

@Schema()
export class Position implements IPosition{
    @Prop({type:mongoose.Schema.Types.ObjectId ,required:true,ref:Department.name})
    departmentId: MongoId | DepartmentDocument;
    _id?: string;
    @Prop({type: String,required:true})
    name: string;
    @Prop({type: String})
    description?: string;
    @Prop({type: String,default:PositionStatus.ACTIVE})
    status?: string;
    @Prop({type: Boolean ,default:false})
    isDeleted?: boolean;
}

export const PositionSchema = SchemaFactory.createForClass(Position)
