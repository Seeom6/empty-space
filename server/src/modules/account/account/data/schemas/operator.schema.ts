import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema({ timestamps: true })
export class Operator {

    @Prop({ type: String, required: false, default: null })
    image: string;
}

export const OperatorSchema = SchemaFactory.createForClass(Operator);
