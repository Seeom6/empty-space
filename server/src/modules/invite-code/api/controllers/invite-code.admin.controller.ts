import { InviteCodeAdminService } from "@Modules/invite-code/services/invite-code.admin.service";
import { Body, Get, Post, Query } from "@nestjs/common";
import { AdminController, queryParser } from "@Package/api";
import { CreateInviteCodeDto, CreateInviteCodeValidation, GetAllInviteCodeDto, GetAllInviteCodeValidator } from "../dto";
import { getAllInviteCodeResponse } from "../dto/response/get-all-invite-code.dto";


@AdminController({
    prefix: "invite-code"
})
export class InviteCodeAdminController {
    constructor(
        private readonly inviteCodeService: InviteCodeAdminService
    ){}

    @Post()
    async createInviteCode(
        @Body(CreateInviteCodeValidation) body: CreateInviteCodeDto
    ){
        return this.inviteCodeService.createInviteCode(body)
    }

    @Get("home")
    async home(){
        return await this.inviteCodeService.home()
    }

    @Get()
    async getAllInviteCode(@Query(GetAllInviteCodeValidator) query: GetAllInviteCodeDto){
        const {pagination, myQuery } = queryParser(query)
        const data= await this.inviteCodeService.getALlInviteCode(pagination, myQuery)
        return getAllInviteCodeResponse(data)
    }
}

