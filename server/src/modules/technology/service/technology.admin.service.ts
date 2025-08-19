import { Injectable } from "@nestjs/common";
import { TechnologyRepo } from "../data";
import { CreateTechnologyRequestDto, UpdateTechnologyRequestDto } from "../api/dto";
import { IParamsId } from "@Package/api";
import { TechnologyStatus } from "../types";
import { TechnologyError } from "./technology.error";
import { ErrorCode } from "@Common/error";
import { getAllTechnologyDto } from "../api/dto/response/get-all.dto";

@Injectable()
export class TechnologyServiceAdmin {
    constructor(
        private readonly technologyRepo: TechnologyRepo,
        private readonly technologyError: TechnologyError
    ){

    }

    async findAll(){ 
        const technologies = await this.technologyRepo.find({filter:{}});
        return technologies;
    }

    async findOne(paramsId: IParamsId){
        return await this.technologyRepo.findOne({filter:{_id:paramsId.id}});
    }

    async create(body: CreateTechnologyRequestDto){
        const isExist = await this.technologyRepo.findOne({filter:{name:body.name}});
        if(isExist) throw this.technologyError.throw(ErrorCode.TECHNOLOGY_EXIST);
        const doc = await this.technologyRepo.create({doc:{...body, status: TechnologyStatus.ACTIVE}});
        return doc;
    }

    async update(paramsId: IParamsId, body: UpdateTechnologyRequestDto){
        const doc = await this.technologyRepo.findOne({filter:{_id:paramsId.id}});
        if(!doc) throw this.technologyError.throw(ErrorCode.TECHNOLOGY_NOT_FOUND);
        if(doc.name !== body.name){
            const isExist = await this.technologyRepo.findOne({filter:{name:body.name}});
            if(isExist) throw this.technologyError.throw(ErrorCode.TECHNOLOGY_EXIST);
        }
        return await this.technologyRepo.findOneAndUpdate({filter:{_id:paramsId.id},update:{...body, status: TechnologyStatus.ACTIVE}});
    }

    async remove(paramsId: IParamsId){
        return await this.technologyRepo.findOneAndUpdate({filter:{_id:paramsId.id},update:{isDeleted:true}});
    }

    async home(){
        const technologies = await this.technologyRepo.aggregate({pipeline:[
            {
                $facet:{
                    count:[
                        {
                            $count:"count"
                        }
                    ],
                    status:[
                        {
                            $group:{
                                _id:"$status",
                                count:{
                                    $sum:1
                                }
                            }
                        },
                        {
                            $project:{
                                _id:0,
                                status:"$_id",
                                count:1
                            }
                        }
                    ]
                }
            }
        ],options:{}});
        return {
            count:technologies[0].count,
            status:technologies[0].status
        }
    }

    async findByIds(paramsId: string[]){
        const technologies = await Promise.all(paramsId.map(async(id) => {
            const technology = await this.technologyRepo.findOne({filter:{_id:id}});
            if(!technology) throw this.technologyError.throw(ErrorCode.TECHNOLOGY_NOT_FOUND);
            return technology;
        }));
        return technologies;
    }
}