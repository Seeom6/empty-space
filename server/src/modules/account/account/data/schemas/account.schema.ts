
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { hashSync } from "bcryptjs";
import { VDocument } from "@Infrastructure/database";
import { Operator, OperatorSchema } from "./operator.schema";
import { AccountRole } from "../../types/role.enum";
import { User, UserSchema } from "./user.schema";
import { Employee, EmployeeSchema } from "./employee.schems";

export type AccountDocument = VDocument<Account>;

@Schema({ timestamps: true })
export class Account {
  @Prop({ type: String, unique: true, required: false, sparse: true })
  email?: string;

  @Prop({ type: String, unique: true, required: false, sparse: true })
  username?: string;

  @Prop({ type: String, unique: true, required: true, sparse: true })
  phoneNumber?: string;

  @Prop({ type: String, required: true })
  firstName?: string;

  @Prop({ type: String, required: true })
  lastName?: string;
  @Prop({
    type: String,
    required: true,
    set: (val: any) => hashSync(val, 10),
  })
  password: string;

  @Prop({
    type: String,
  })
  image?: string;

  @Prop({ type: Boolean, default: true })
  isActive?: boolean;

  @Prop({
    type: OperatorSchema,
    default: null
  })
  operator?: Operator

  @Prop({
    type: UserSchema,
    default: null
  })
  user?: User;

  @Prop({
    type: EmployeeSchema,
    default: null
  })
  employee?: Employee;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(AccountRole),
    default: AccountRole.OPERATOR,
  })
  accountRole: AccountRole;

  @Prop({ type: Boolean, default: true })
  isVerified?: boolean;

  @Prop({ type: Date, default: null })
  birthday?: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
