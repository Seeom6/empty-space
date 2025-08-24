import { InviteCodeDocument } from "@Modules/invite-code/data";


export function  getAllInviteCodeResponse(inviteCodes: InviteCodeDocument[]){
    return inviteCodes.map(inviteCode => {
        const account = inviteCode["account"]
        const accountInfo  = {
            email: account?.email,
            lastName: account?.lastName,
            firstName: account?.firstName,
            
        }
        return {
            code: inviteCode.code,
            status: inviteCode.status,
            position: inviteCode.position["name"],
            account: account ? accountInfo : null,
            createdAt: inviteCode["createdAt"],
        }
    })
}