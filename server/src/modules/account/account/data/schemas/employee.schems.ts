import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IEmployee } from "../entity/employee.entity";
import { Position, PositionDocument } from "@Modules/position/data";
import { MongoId } from "@Package/utilities";
import * as mongoose from "mongoose";
import { Department, DepartmentDocument } from "@Modules/department/data/department.schema";
import { Technology, TechnologyDocument } from "@Modules/technology/data/technology.schema";
import { string } from "joi";
import { EmployeeStatus } from "@Modules/account/employee/types";

@Schema()
export class Employee  implements IEmployee{

    @Prop({ type: String, required: false, default: null })
    image?: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: Department.name })
    department: MongoId | DepartmentDocument;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: Position.name })
    position: MongoId | PositionDocument;
    @Prop({ type: String, required: true })
    employmentType: string;
    @Prop({ type: [mongoose.Schema.Types.ObjectId], required: true, ref: Technology.name })
    technologies: MongoId[] | TechnologyDocument[];
    @Prop({ type: Number, default: null })
    baseSalary?: number;
    @Prop({
        type: String,
        required: true
    })
    inviteCode?: string;
    @Prop({
        type: String,
        default: EmployeeStatus.ACTIVE
    })
    status: EmployeeStatus;

    @Prop({
        type: Date,
        default: new Date().toISOString()
    })
    hireDate?: Date;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
