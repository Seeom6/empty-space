import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
export type LocalizableStringDocument = LocalizableString & Document;

@Schema({ timestamps: false, _id: false })
export class LocalizableString {
  @Prop({ type: String })
  en: string;
  @Prop({ type: String })
  ar: string;
}

export const LocalizableStringSchema =
  SchemaFactory.createForClass(LocalizableString);
