import { Injectable } from "@nestjs/common";
import { InviteCodeRepo } from "../data";
import { CreateInviteCodeDto, GetAllInviteCodeDto  } from "../api/dto";
import { generateRandomString } from "@Package/utilities";
import { PositionAdminService } from "@Modules/position/services/position.admin.service";
import { InviteCodeError } from "./invite-code.error";
import { Pagination, QueryValue } from "@Package/api";
import { InviteCodeStatus } from "../types";
import { ErrorCode } from "@Common/error";
import { UpdateInviteCodeStatusDto } from "@Modules/auth/api/dto/request";

@Injectable()
export class InviteCodeAdminService {
    constructor(
        private readonly inviteCodeRepo: InviteCodeRepo,
        private readonly positionService: PositionAdminService,
        private readonly inviteCodeError: InviteCodeError
    ){}

    async createInviteCode(body: CreateInviteCodeDto){
        const inviteCode = await this.generateInviteCode()
        await this.positionService.findOne({id: body.position})
        await this.inviteCodeRepo.create({doc: {...body, code: inviteCode} as any})
        return
    }

    async home(){
        const result = await this.inviteCodeRepo.aggregate({
            pipeline: [
                {
                    $group: {
                        _id: "$status",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        status: "$_id",
                        count: 1
                    }
                }
            ]
        })
        return result
    }

    async getALlInviteCode(pagination: Pagination, query: QueryValue<GetAllInviteCodeDto>){
        const invitesCode = await this.inviteCodeRepo.aggregate({
            pipeline: [
                {
                    $match: {
                        ...query
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $skip: pagination.skip
                },
                {
                    $limit: pagination.limit
                },
                {
                    $lookup: {
                        from: "positions",
                        localField: "position",
                        foreignField: "_id",
                        as: "position"
                    }
                },
                {
                    $addFields: {
                        position: {
                            $arrayElemAt: ["$position", 0]
                        }
                    }
                },
                {
                    $lookup: {
                        from: "accounts",
                        localField: "code",
                        foreignField: "employee.inviteCode",
                        as: "account"
                    }
                },
                {
                    $addFields: {
                        account: {
                            $arrayElemAt: ["$account", 0]
                        }
                    }
                },
                {
                    $project: {
                        code: 1,
                        status: 1,
                        position: 1,
                        account: 1,
                        createdAt: 1,
                    }
                }
            ]
        })
        return invitesCode
    }

    async checkInviteCodeForRegister(code: string){
        const inviteCode = await this.inviteCodeRepo.findOne({
            filter: {code: code, status: InviteCodeStatus.Active}, 
            options: {
                populate: {
                    path: "position",
                }
            },
            })
            
        return inviteCode
    }

    async updateInviteCode(body: UpdateInviteCodeStatusDto){
        const inviteCode = await this.inviteCodeRepo.findOne({filter: {code: body.code}})
        if(!inviteCode){
            this.inviteCodeError.throw(ErrorCode.INVITE_CODE_NOT_FOUND)
        }
        await this.inviteCodeRepo.findOneAndUpdate({filter: {code: body.code}, update: {status: body.status}})
        return
    }

    private async generateInviteCode(){
        const inviteCode  = `$INV-${new Date().getFullYear()}-${generateRandomString(6)}`
        const isExist = await this.inviteCodeRepo.findOne({filter: {code: inviteCode}})
        if(isExist){
            return this.generateInviteCode()
        }
        return inviteCode
    }
}