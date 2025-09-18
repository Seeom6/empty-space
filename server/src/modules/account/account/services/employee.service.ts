import { Injectable } from "@nestjs/common";
import { AccountRepository, IAccount } from "../data";
import { AccountRole } from "../types/role.enum";
import { EmployeeStatus } from "@Modules/account/account/data/schemas/account.schema";
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
                email: account.email,
                firstName: account.firstName,
                lastName: account.lastName,
                password: account.password,
                accountRole: AccountRole.ADMIN,
                isActive: true,
                isVerified: true,
                failedLoginAttempts: 0,
                employee: {
                    ...account.employee,
                    status: EmployeeStatus.ACTIVE,
                    hireDate: new Date()
                } as any
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