import { Injectable } from "@nestjs/common";
import { AccountRepository, IAccount } from "../data";
import { AccountRole } from "../types/role.enum";
import { EmployeeStatus } from "@Modules/account/employee/types";
import { ErrorCode } from "@Common/error";
import { AccountError } from "./account.error";

@Injectable()
export class EmployeeService {

    constructor(
        private readonly accountRepo: AccountRepository,
        private readonly employeeError: AccountError,
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

    async findEmployeeByIds(param: {ids: string[], throwError?: boolean}){
        const employees = await Promise.all(param.ids.map(async(id) => {
            const employee = await this.accountRepo.findOne({filter:{_id:id}});
            if(!employee && param.throwError) throw this.employeeError.throw(ErrorCode.EMPLOYEE_NOT_FOUND);
            return employee;
        }));
        return employees;
    }
}