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

    @Prop({type: String, required: true, unique: true, index: true})
    code: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, required: true, ref: Position.name, index: true})
    position: Types.ObjectId;

    @Prop({type: String, default: InviteCodeStatus.Active, index: true})
    status: InviteCodeStatus;

    // Usage tracking
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Account', sparse: true, index: true})
    usedBy?: Types.ObjectId;

    @Prop({type: Date})
    usedAt?: Date;

    // Expiration management
    @Prop({type: Date, index: true})
    expiresAt?: Date;

    // Audit fields
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, index: true})
    createdBy: Types.ObjectId;

    // Metadata
    @Prop({type: String, maxlength: 500})
    notes?: string;

    @Prop({type: Number, default: 1, min: 1})
    maxUses: number;

}


export const InviteCodeSchema = SchemaFactory.createForClass(InviteCode);

// Create indexes
InviteCodeSchema.index({ code: 1 }, { unique: true });
InviteCodeSchema.index({ status: 1, expiresAt: 1 });
InviteCodeSchema.index({ position: 1 });
InviteCodeSchema.index({ createdBy: 1, createdAt: 1 });
InviteCodeSchema.index({ usedBy: 1 }, { sparse: true });