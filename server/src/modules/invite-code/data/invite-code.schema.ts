import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IInviteCode } from "./invite-code.entity";
import mongoose, { Types } from "mongoose";
import { VDocument } from "@Infrastructure/database";

export type InviteCodeDocument = VDocument<InviteCode>

@Schema({timestamps: true})
export class InviteCode implements IInviteCode {
    @Prop({type: String, required: true, unique: true})
    code: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, required: true})
    position: Types.ObjectId;

}


export const InviteCodeSchema = SchemaFactory.createForClass(InviteCode)