import { PositionAdminService } from "./services/position.admin.service";
import { PositionRepo } from "./data/position.repository";
import { Position } from "./data/position.schema";
import { PositionSchema } from "./data/position.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { PositionError } from "./services/position.error";
import { CreatePositionDtoValidator, UpdatePositionDtoValidator } from "./api/dto";
import { PositionAdminController } from "./api/controllers/position.admin.controller";
import { DepartmentModule } from "@Modules/department/department.module";

@Module({
    imports:[
        MongooseModule.forFeature([
            { name: Position.name, schema: PositionSchema },
        ]),
        DepartmentModule
    ],
    controllers:[PositionAdminController],
    providers:[
        PositionAdminService,
        PositionRepo,
        PositionError,
        CreatePositionDtoValidator,
        UpdatePositionDtoValidator
    ],
    exports:[PositionAdminService]
})
export class PositionModule {
    
}
