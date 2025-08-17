import { Module } from "@nestjs/common";
import { TechnologyError, TechnologyServiceAdmin } from "./service";
import { Technology, TechnologyRepo, technologySchema } from "./data";
import { TechnologyAdminController } from "./api/controller";
import { MongooseModule } from "@nestjs/mongoose";
import { CreateTechnologyValidation } from "./api/dto";


@Module({
    controllers: [TechnologyAdminController],
    imports: [MongooseModule.forFeature([{name: Technology.name,schema: technologySchema}])],
    providers: [
        TechnologyServiceAdmin,
        TechnologyError,
        TechnologyRepo,
        CreateTechnologyValidation
    ]
})
export class TechnologyModule {

}