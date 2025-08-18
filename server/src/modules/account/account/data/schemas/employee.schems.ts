import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IEmployee } from "../entity/employee.entity";
import { Position, PositionDocument } from "@Modules/position/data";
import { MongoId } from "@Package/utilities";
import * as mongoose from "mongoose";
import { Department, DepartmentDocument } from "@Modules/department/data/department.schema";

@Schema()
export class Employee  implements IEmployee{

    @Prop({ type: String, required: false, default: null })
    image: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: Department.name })
    department: MongoId | DepartmentDocument;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: Position.name })
    position: MongoId | PositionDocument;
    @Prop({ type: String, required: true })
    employmentType: string
    @Prop({ type: Number, required: true })
    baseSalary: number;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
