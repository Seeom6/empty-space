import { Injectable } from "@nestjs/common";
import { PositionRepo } from "../data/position.repository";
import { PositionError } from "./position.error";
import { IParamsId } from "@Package/api";
import { CreatePositionDto } from "../api/dto";
import { UpdatePositionDto } from "../api/dto";
import { PositionStatus } from "../types/position-status.type";
import { ErrorCode } from "@Common/error";
import { DepartmentAdminService } from "@Modules/department/services/department.admin.service";

@Injectable()
export class PositionAdminService {
    constructor(
        private readonly positionRepo: PositionRepo,
        private readonly positionError: PositionError,
        private readonly departmentService: DepartmentAdminService  
    ){
    }

    async findAll(){
        const positions = await this.positionRepo.find({filter:{isDeleted:false}});
        return positions;
    }

    async findOne(paramsId: IParamsId){
        return await this.positionRepo.findOne(
            {filter:{_id:paramsId.id,isDeleted:false}, 
            options:{populate:{path:"departmentId",select:"name"}},
            error:this.positionError.error(ErrorCode.DEPARTMENT_NOT_FOUND)
            });
    }

    async create(body: CreatePositionDto){
        await this.departmentService.findOne({id:body.departmentId});
        const isExist = await this.positionRepo.findOne({filter:{name:body.name}});
        if(isExist) throw this.positionError.throw(ErrorCode.POSITION_EXIST);
        const doc = await this.positionRepo.create({doc:{...body, status: PositionStatus.ACTIVE} as any});
        return ;
    }

    async update(paramsId: IParamsId, body: UpdatePositionDto){
        const doc = await this.positionRepo.findOne({filter:{_id:paramsId.id,isDeleted:false}, error:this.positionError.error(ErrorCode.POSITION_NOT_FOUND)});
        if(doc.name !== body.name){
            const isExist = await this.positionRepo.findOne({filter:{name:body.name,isDeleted:false}});
            if(isExist) throw this.positionError.throw(ErrorCode.POSITION_EXIST);
        }
        await this.departmentService.findOne({id:body.departmentId});
        return await this.positionRepo.findOneAndUpdate({filter:{_id:paramsId.id},update:{...body, status: PositionStatus.ACTIVE} as any, error:this.positionError.error(ErrorCode.POSITION_NOT_FOUND)});
    }

    async remove(paramsId: IParamsId){
        return await this.positionRepo.findOneAndUpdate({filter:{_id:paramsId.id,isDeleted:false},update:{isDeleted:true} as any, error:this.positionError.error(ErrorCode.POSITION_NOT_FOUND)});
    }
}
    