import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongooseSchema } from 'mongoose';
import * as mongoose from 'mongoose';
import { LocalFile } from './localFile.schema';

export type OperatorDocument = Operator & Document;

@Schema({ timestamps: true })
export class Operator {
  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: Boolean, required: true, default: false })
  canShowGhost: boolean;

  @Prop({
    type: mongooseSchema.Types.ObjectId,
    ref: LocalFile.name,
    default: null,
  })
  image?: mongoose.Types.ObjectId;
}

export const OperatorSchema = SchemaFactory.createForClass(Operator);
