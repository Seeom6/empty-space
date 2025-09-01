import { Employee } from "@Modules/account/account/data/schemas/employee.schems";
import { Technology } from "@Modules/technology/data";
import mongoose, { Types } from "mongoose";
import { ProjectStatus, ProjectPriority } from "../types";
import { IProject } from "./project.entity";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { VDocument } from "@Infrastructure/database";
import {Account} from "@Modules/account/account/data";


export type ProjectDocument = VDocument<Project>


@Schema({timestamps: true})
export class Project implements IProject {
    @Prop({
        type: [String],
        default:[]
    })
    tags: string[];
    @Prop({
        type: String,
        require: true
    })
    description: string;

    @Prop({
        type: String,
        require: true
    })
    name: string;
    @Prop({
        type: String,
        require: true,
        enum: ProjectStatus
    })
    status: ProjectStatus;
    @Prop({
        type: String,
        require: true,
        enum: ProjectPriority
    })
    priority: ProjectPriority;
    @Prop({
        type: Number,
        default: null
    })
    progress: number;
    @Prop({
        type: Number,
        default: null
    })
    budget: number;
    @Prop({
        type: Date,
        required: true
    })
    endDate: Date;
    @Prop({
        type: Date,
        required: true
    })
    startDate: Date;
    @Prop({
        type: Date,
        required: true
    })
    deadline: Date;
    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: Account.name,
        required: true
    })
    members: (Types.ObjectId | Account)[];
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Account.name,
        required: true
    })
    manger: Types.ObjectId | Account;
    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
      ref: Technology.name
    })
    technology: (mongoose.Types.ObjectId | Technology)[];
    
}

export const ProjectSchema = SchemaFactory.createForClass(Project)