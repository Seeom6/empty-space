import {
    LocalizableStringDocument,
    LocalizableStringSchema,
} from './localizableString.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export enum privilegeKeys {
    //role management
    createRole = 'createRole',
    viewRole = 'viewRole',
    updateRole = 'updateRole',
    deleteRole = 'deleteRole',

    //operator management
    createOperator = 'createOperator',
    viewOperator = 'viewOperator',
    updateOperator = 'updateOperator',
    deleteOperator = 'deleteOperator',
}

export type PrivilegeDocument = Privilege & Document;

@Schema()
export class Privilege {
    @Prop({ type: String, required: true, enum: Object.values(privilegeKeys) })
    key: string;

    @Prop({ type: LocalizableStringSchema, required: true })
    privilegeActionName: LocalizableStringDocument;

    @Prop({ type: String, required: true })
    privilegeAction: string;

    @Prop({ type: LocalizableStringSchema, required: true })
    builtInRoleName: LocalizableStringDocument;

    @Prop({ type: LocalizableStringSchema, required: true })
    description: LocalizableStringDocument;
}

export const PrivilegeSchema = SchemaFactory.createForClass(Privilege);
