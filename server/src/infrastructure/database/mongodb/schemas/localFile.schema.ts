import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type LocalFileDocument = LocalFile & Document;

@Schema({ timestamps: true })
export class LocalFile {
  @Prop({ type: String, required: true })
  filename: string;

  @Prop({ type: String, required: true })
  mimetype: string;

  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: String, required: true })
  originalFilename: string;

  @Prop({ type: String, required: true })
  relativePath: string;

  @Prop({ type: String, required: true })
  extension: string;
}

export const LocalFileSchema = SchemaFactory.createForClass(LocalFile);
