import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { InviteCode, InviteCodeRepo, InviteCodeSchema } from "./data";
import { PositionModule } from "@Modules/position/position.module";
import { InviteCodeAdminController } from "./api/controllers/invite-code.admin.controller";
import { InviteCodeAdminService } from "./services/invite-code.admin.service";
import { InviteCodeError } from "./services/invite-code.error";
import { CreateInviteCodeValidation, GetAllInviteCodeValidator } from "./api/dto";

@Module({
    imports: [
        MongooseModule.forFeature([{name: InviteCode.name, schema: InviteCodeSchema}]),
        PositionModule
    ],
    controllers:[InviteCodeAdminController],
    providers: [GetAllInviteCodeValidator,CreateInviteCodeValidation,InviteCodeAdminService, InviteCodeError, InviteCodeRepo],
    exports: [InviteCodeAdminService]

})
export class InviteCodeModule {

}