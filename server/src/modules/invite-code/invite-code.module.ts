import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { InviteCode, InviteCodeSchema } from "./data";

@Module({
    imports: [MongooseModule.forFeature([{name: InviteCode.name, schema: InviteCodeSchema}])]
})
export class InviteCodeModule {

}