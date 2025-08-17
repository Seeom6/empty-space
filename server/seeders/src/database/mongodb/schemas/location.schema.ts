import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema({ timestamps: false, _id: false })
export class Location {
  @Prop({ type: Number, required: true })
  latitude: number;
  @Prop({ type: Number, required: true })
  longitude: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
