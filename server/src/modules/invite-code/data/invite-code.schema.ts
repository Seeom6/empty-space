import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IInviteCode } from "./invite-code.entity";
import mongoose, { Types } from "mongoose";
import { VDocument } from "@Infrastructure/database";
import { InviteCodeStatus } from "../types";
import { Position } from "@Modules/position/data";

export type InviteCodeDocument = VDocument<InviteCode>

@Schema({timestamps: true})
export class InviteCode implements IInviteCode {
    _id?: Types.ObjectId;

    @Prop({type: [mongoose.Schema.Types.ObjectId], default: []})
    privilege: Types.ObjectId[];
    
    @Prop({type: String, required: true, unique: true})
    code: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, required: true, ref: Position.name})
    position: Types.ObjectId;

    @Prop({type: String, default: InviteCodeStatus.Active})
    status: InviteCodeStatus 

}


export const InviteCodeSchema = SchemaFactory.createForClass(InviteCode)