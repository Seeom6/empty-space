import { Account, AccountRepository } from "@Modules/account/account/data";
import { EmployeeError } from "./employee.error";
import { IParamsId } from "@Package/api";
import { UpdateEmployeeDto, UpdateEmployeePasswordDto } from "../api/dto";
import { EmployeeStatus } from "../types/employee-status.type";
import { ErrorCode } from "@Common/error";
import { CreateEmployeeDto } from "../api/dto/create-employee.dto";
import { DepartmentAdminService } from "@Modules/department/services/department.admin.service";
import { PositionAdminService } from "@Modules/position/services/position.admin.service";
import { Employee } from "@Modules/account/account/data/schemas/employee.schems";
import { AccountRole } from "@Modules/account/account/types/role.enum";


export class EmployeeAdminService {
    constructor(
        private readonly accountRepo: AccountRepository,
        private readonly departmentService: DepartmentAdminService,
        private readonly positionService: PositionAdminService,
        private readonly employeeError: EmployeeError,
    ){
    }

    async findAll(){
        const employees = await this.accountRepo.find({filter:{type:AccountRole.EMPLOYEE,isDeleted:false}});
        return employees;
    }

    async findOne(paramsId: IParamsId){
        return await this.accountRepo.findOne({filter:{_id:paramsId.id,type:AccountRole.EMPLOYEE,isDeleted:false}});
    }

    async create(body: CreateEmployeeDto){
        const isExist = await this.accountRepo.findOne({filter:{email:body.email}});
        if(isExist) throw this.employeeError.throw(ErrorCode.EMPLOYEE_EXIST);
        const department = await this.departmentService.findOne({id:body.departmentId});
        const position = await this.positionService.findOne({id:body.positionId});
        const employee: Employee = {
            image: body.image,
            department,
            position,
            employmentType: body.employmentType,
            baseSalary: body.baseSalary,
        }
        const account: Account = {
            email: body.email,
            password: body.password,
            firstName: body.firstName,
            lastName: body.lastName,
            phoneNumber: body.phoneNumber,
            accountRole: AccountRole.ADMIN,
            employee,
            isActive: true,
            isVerified: true,
        }
        await this.accountRepo.create({doc:{...body, status: EmployeeStatus.ACTIVE, employee} as any});
        return;
    }

    async update(paramsId: IParamsId, body: UpdateEmployeeDto){
        const doc = await this.accountRepo.findOne({filter:{_id:paramsId.id,type:AccountRole.EMPLOYEE,isDeleted:false}, error:this.employeeError.error(ErrorCode.EMPLOYEE_NOT_FOUND)});
        if(doc.email !== body.email){
            const isExist = await this.accountRepo.findOne({filter:{email:body.email,type:AccountRole.EMPLOYEE,isDeleted:false}});
            if(isExist) throw this.employeeError.throw(ErrorCode.EMPLOYEE_EXIST);
        }
        const department = await this.departmentService.findOne({id:body.departmentId});
        const position = await this.positionService.findOne({id:body.positionId});
        const employee: Employee = {
            image: body.image,
            department,
            position,
            employmentType: body.employmentType,
            baseSalary: body.baseSalary,
        }
        doc.employee = employee;
        doc.email = body.email;
        doc.phoneNumber = body.phoneNumber;
        doc.firstName = body.firstName;
        doc.lastName = body.lastName;
        doc.image = body.image;
        return await this.accountRepo.findOneAndUpdate({filter:{_id:paramsId.id,type:AccountRole.EMPLOYEE,isDeleted:false},update:{...body, employee} as any, error:this.employeeError.error(ErrorCode.EMPLOYEE_NOT_FOUND)});
    }

    async remove(paramsId: IParamsId){
        return await this.accountRepo.findOneAndUpdate({filter:{_id:paramsId.id,type:AccountRole.EMPLOYEE,isDeleted:false},update:{isDeleted:true} as any, error:this.employeeError.error(ErrorCode.EMPLOYEE_NOT_FOUND)});
    }

    async updatePassword(paramsId: IParamsId, body: UpdateEmployeePasswordDto){
        return await this.accountRepo.findOneAndUpdate({filter:{_id:paramsId.id,type:AccountRole.EMPLOYEE,isDeleted:false},update:{password:body.password} as any, error:this.employeeError.error(ErrorCode.EMPLOYEE_NOT_FOUND)});
    }
}
