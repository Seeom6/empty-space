import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { TechnologyStatus } from "../types";
import { ITechnology } from "./technology.entity";
import { VDocument } from "@Infrastructure/database";


export type TechnologyDocument = VDocument<ITechnology>

@Schema({timestamps: true})
export class Technology implements ITechnology {

    @Prop({type: String, required: true})
    name: string;
    @Prop({type: String, required: true})
    version: string;
    @Prop({type: String, required: true})
    icon: string;
    @Prop({type: String, required: true})
    website: string;
    @Prop({type: String, default: TechnologyStatus.ACTIVE})
    status: TechnologyStatus;
    @Prop({type: String, required: true})
    description: string;
    @Prop({type: String, required: true})
    category: string;
    @Prop({type: Boolean, default: false})
    isDeleted: boolean;

}

export const technologySchema = SchemaFactory.createForClass(Technology)