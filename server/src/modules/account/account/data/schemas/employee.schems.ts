import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IEmployee } from "../entity/employee.entity";


@Schema()
export class Employee  implements IEmployee{

    @Prop({ type: String, required: false, default: null })
    image: string;
    @Prop({ type: String, required: true })
    department: string;
    @Prop({ type: String, required: true })
    position: string;

    @Prop({ type: String, required: true })
    employmentType: string

    @Prop({ type: Number, required: true })
    baseSalary: number;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
