import { Schema as mongooseSchema } from "mongoose";
import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { hashSync } from "bcryptjs";
import { Operator, OperatorDocument } from "./operator.schema";
import { User, UserDocument } from "./user.schema";
import { Role, RoleDocument } from "./role.schema";


export enum AccountRole {
  USER = 'user',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  SUPER_ADMIN = 'super_admin',
}

export type  AccountDocument =Account & mongoose.Document
@Schema({ timestamps: true })
export class Account {
    @Prop({ type: String, unique: true, required: false, sparse: true })
    email?: string;

    @Prop({ type: String, unique: true, required: false, sparse: true })
    username?: string;

    @Prop({ type: String, unique: true, required: false, sparse: true })
    phoneNumber?: string;

    @Prop({
        type: String,
        required: true,
        set: (val: any) => hashSync(val, 10),
    })
    password: string;

    @Prop({ type: Boolean, default: true })
    isActive?: boolean;

    @Prop({
        type: mongooseSchema.Types.ObjectId,
        ref: Operator.name,
    })
    operator?: mongoose.Types.ObjectId | OperatorDocument;

    @Prop({
        type: mongooseSchema.Types.ObjectId,
        ref: User.name,
    })
    user?: mongoose.Types.ObjectId | UserDocument;

    @Prop({
        type: String,
        required: true,
        enum: Object.values(AccountRole),
        default: AccountRole.USER,
    })
    accountRole: AccountRole;

    @Prop({
        type: mongooseSchema.Types.ObjectId,
        ref: Role.name,
    })
    role: mongoose.Types.ObjectId | RoleDocument;

    @Prop({ type: Boolean, default: true })
    changePassword: boolean;

    @Prop({ type: Boolean, default: true })
    isVerified?: boolean;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
