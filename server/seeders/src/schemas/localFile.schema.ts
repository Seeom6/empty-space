import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocalFileDocument = LocalFile & Document;

@Schema({ timestamps: true })
export class LocalFile {
  @Prop({ type: String, required: true })
  filename: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: true })
  mimetype: string;

  @Prop({ type: Number, required: true })
  size: number;

  @Prop({ type: String })
  originalName?: string;

  @Prop({ type: String })
  encoding?: string;

  @Prop({ type: String })
  url?: string;
}

export const LocalFileSchema = SchemaFactory.createForClass(LocalFile);
