import { Injectable } from "@nestjs/common";
import { DepartmentError } from "./department.error";
import { DepartmentRepo } from "../data/department.repository";
import { IParamsId } from "@Package/api";
import { DepartmentStatus } from "../types/department-status.type";
import { ErrorCode } from "@Common/error";
import { CreateDepartmentDto } from "../api/dto";
import { UpdateDepartmentDto } from "../api/dto";

@Injectable()   
export class DepartmentAdminService {
    constructor(
        private readonly departmentRepo: DepartmentRepo,
        private readonly departmentError: DepartmentError
    ){
    }

    async findAll(){
        const departments = await this.departmentRepo.find({filter:{}});
        return departments;
    }

    async findOne(paramsId: IParamsId){
        return await this.departmentRepo.findOne({filter:{_id:paramsId.id,isDeleted:false}, error:this.departmentError.error(ErrorCode.DEPARTMENT_NOT_FOUND)});
    }

    async create(body: CreateDepartmentDto){
        const isExist = await this.departmentRepo.findOne({filter:{name:body.name}});
        if(isExist) throw this.departmentError.throw(ErrorCode.DEPARTMENT_EXIST);
        const doc = await this.departmentRepo.create({doc:{...body, status: DepartmentStatus.ACTIVE} as any});
        return doc;
    }

    async update(paramsId: IParamsId, body: UpdateDepartmentDto){
        const doc = await this.departmentRepo.findOne({filter:{_id:paramsId.id}});
        if(!doc) throw this.departmentError.throw(ErrorCode.DEPARTMENT_NOT_FOUND);
        if(doc.name !== body.name){
            const isExist = await this.departmentRepo.findOne({filter:{name:body.name}});
            if(isExist) throw this.departmentError.throw(ErrorCode.DEPARTMENT_EXIST);
        }
        return await this.departmentRepo.findOneAndUpdate({filter:{_id:paramsId.id},update:{...body, status: DepartmentStatus.ACTIVE} as any});
    }

    async remove(paramsId: IParamsId){
        return await this.departmentRepo.findOneAndUpdate({filter:{_id:paramsId.id},update:{isDeleted:true} as any});
    }
}