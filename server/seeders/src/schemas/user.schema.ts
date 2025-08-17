import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';


export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    OPERATOR = 'operator',
  }
  
export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({
        type: String,
        required: true
    }) 
    firstName: string;

    @Prop({
        type: String,
        required: true,
    })
    lastName: string;

    @Prop({
        type: String,
        default: UserRole.USER,
        enum: UserRole
    })
    role?: UserRole

    @Prop({
        type: String,
    })
    phone?: string;

    @Prop({ default: false })
    isActive?: boolean;

    @Prop({
        type: Date,
        default: null
    })
    deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);