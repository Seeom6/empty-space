import {
  PrivilegeDocument,
  PrivilegeSchema,
} from "../../privilege/data/privilege.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Document } from "mongoose";
import { LocalizableStringSchema, LocalizableStringDocument, LocalizableString } from "@Infrastructure/database";
import { AccountRole } from "@Modules/account/account/types/role.enum";
export type RoleDocument = Role & Document;
@Schema({ timestamps: true })
export class Role {
  @Prop({ type: String, default: AccountRole.OPERATOR, enum: Object.values(AccountRole) })
  key?: string;

  @Prop({
    type: LocalizableStringSchema,
    unique: true,
    required: true,
  })
  name: LocalizableString;

  @Prop({ type: Boolean, default: false })
  buildIn: boolean;

  @Prop({ type: [PrivilegeSchema], required: true, _id: false })
  privileges: PrivilegeDocument[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
