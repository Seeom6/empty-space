
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { VDocument } from "@Infrastructure/database";
import { Operator, OperatorSchema } from "./operator.schema";
import { AccountRole } from "../../types/role.enum";
import { User, UserSchema } from "./user.schema";
import { Employee, EmployeeSchema } from "./employee.schems";
import { Types } from 'mongoose';

export type AccountDocument = VDocument<Account>;

export enum EmployeeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  TERMINATED = 'Terminated'
}

@Schema({ timestamps: true })
export class Account {
  @Prop({ type: String, unique: true, required: true, index: true })
  email: string;

  @Prop({ type: String, unique: true, sparse: true, index: true })
  phoneNumber?: string;

  @Prop({ type: String, unique: true, sparse: true, index: true })
  username?: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 50 })
  firstName: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 50 })
  lastName: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, enum: AccountRole, required: true, index: true })
  accountRole: AccountRole;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false, index: true })
  isVerified: boolean;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Date })
  birthday?: Date;

  // Enhanced Employee-specific data
  @Prop({
    type: {
      inviteCode: { type: String, required: true },
      position: { type: Types.ObjectId, ref: 'Position', required: true, index: true },
      department: { type: Types.ObjectId, ref: 'Department', required: true, index: true },
      privileges: [{ type: Types.ObjectId, ref: 'Privilege' }],
      hireDate: { type: Date, required: true },
      status: { type: String, enum: EmployeeStatus, default: EmployeeStatus.ACTIVE },
      baseSalary: { type: Number, min: 0 },
      employmentType: { type: String, maxlength: 50 },
      firstName: { type: String, maxlength: 50 },
      lastName: { type: String, maxlength: 50 },
      technologies: [{ type: Types.ObjectId, ref: 'Technology' }]
    },
    required: false
  })
  employee?: {
    inviteCode: string;
    position: Types.ObjectId;
    department: Types.ObjectId;
    privileges: Types.ObjectId[];
    hireDate: Date;
    status: EmployeeStatus;
    baseSalary?: number;
    employmentType?: string;
    firstName?: string;
    lastName?: string;
    technologies?: Types.ObjectId[];
  };

  @Prop({ type: UserSchema, required: false })
  user?: User;

  @Prop({ type: OperatorSchema, required: false })
  operator?: Operator;

  // Audit fields
  @Prop({ type: Date })
  lastLoginAt?: Date;

  // Security fields
  @Prop({ type: Date })
  passwordChangedAt?: Date;

  @Prop({ type: Number, default: 0, min: 0 })
  failedLoginAttempts: number;

  @Prop({ type: Date })
  lockedUntil?: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

// Create indexes
AccountSchema.index({ email: 1 }, { unique: true });
AccountSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });
AccountSchema.index({ accountRole: 1, isActive: 1 });
AccountSchema.index({ 'employee.department': 1 });
AccountSchema.index({ 'employee.position': 1 });
AccountSchema.index({ createdAt: 1 });
AccountSchema.index({ lastLoginAt: 1 });
AccountSchema.index({ failedLoginAttempts: 1, lockedUntil: 1 });
