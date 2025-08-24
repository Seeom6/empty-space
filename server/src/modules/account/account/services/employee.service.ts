import { Injectable } from "@nestjs/common";
import { AccountRepository, IAccount } from "../data";
import { AccountRole } from "../types/role.enum";
import { EmployeeStatus } from "@Modules/account/employee/types";

@Injectable()
export class EmployeeService {

    constructor(
        private readonly accountRepo: AccountRepository,
    ){

    }
    async createEmployee(account: IAccount){
        return await this.accountRepo.create({
            doc: {
                password:account.password,
                accountRole: AccountRole.ADMIN,
                employee: {
                    ...account.employee,
                    status: EmployeeStatus.ACTIVE,
                }
            }
        })
    }
}