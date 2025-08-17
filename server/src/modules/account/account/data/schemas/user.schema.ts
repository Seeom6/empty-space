import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema({ timestamps: true })
export class User {

    @Prop({ type: String, required: false, default: null })
    image: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
