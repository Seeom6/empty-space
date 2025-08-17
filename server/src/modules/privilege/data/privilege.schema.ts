import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { LocalizableStringSchema, LocalizableStringDocument, VDocument } from "@Infrastructure/database";
import { privilegeKeys } from "../../shared/config/privilege";
export type PrivilegeDocument = VDocument<Privilege>;

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
