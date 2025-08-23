import { Injectable } from "@nestjs/common";
import { InviteCodeRepo } from "../data";
import { CreateInviteCodeDto } from "../api/dto";

@Injectable()
export class InviteCodeAdminService {
    constructor(
        private readonly inviteCodeRepo: InviteCodeRepo
    ){}

    createInviteCode(body: CreateInviteCodeDto){
        return this.inviteCodeRepo.create({doc: {...body} as any})
    }
}