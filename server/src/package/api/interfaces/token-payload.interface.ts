import { AccountRole } from "@Modules/account/account/types/role.enum";

export interface AccountPayload {
    accountId: string;
    accountRole: AccountRole
    email: string
    isActive: boolean
    isVerified: boolean
}


export interface RefreshTokenPayload  {
    
}
