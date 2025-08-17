import {
    LocalizableStringDocument,
    LocalizableStringSchema,
} from './localizableString.schema';
import { PrivilegeDocument, PrivilegeSchema } from './privilege.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export enum roleKeys {
    SUPER_ADMIN = 'SUPER_ADMIN',
    OPERATOR = 'OPERATOR',
    USER = 'USER',
    SELlER = 'SELLER',
    COMPANY = 'COMPANY',
}
export type RoleDocument = Role & Document;
@Schema({ timestamps: true })
export class Role {
    @Prop({ type: String, default: 'OPERATOR', enum: Object.values(roleKeys) })
    key?: string;

    @Prop({
        type: LocalizableStringSchema,
        unique: true,
        required: true,
    })
    name: LocalizableStringDocument;

    @Prop({ type: Boolean, default: false })
    buildIn: boolean;

    @Prop({ type: [PrivilegeSchema], required: true, _id: false })
    privileges: PrivilegeDocument[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
