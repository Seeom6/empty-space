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
import { Injectable } from "@nestjs/common";
import { TechnologyServiceAdmin } from "@Modules/technology/service";
import { AccountDocument } from "@Modules/account/account/data";

@Injectable()
export class EmployeeAdminService {
    constructor(
        private readonly accountRepo: AccountRepository,
        private readonly departmentService: DepartmentAdminService,
        private readonly positionService: PositionAdminService,
        private readonly technologyService: TechnologyServiceAdmin,
        private readonly employeeError: EmployeeError,
    ){
    }

    async findAll(): Promise<AccountDocument[]> {
        const employees = await this.accountRepo.find(
            {
                filter:{accountRole:AccountRole.EMPLOYEE},
                options:{populate:[
                    {
                        path:"employee.department",
                    },
                    {
                        path:"employee.position",
                    },
                    {
                        path:"employee.technologies",
                    }
                ]}
            }
        );
        return employees;
    }

    async findOne(paramsId: IParamsId){
        return await this.accountRepo.findOne({filter:{_id:paramsId.id,accountRole:AccountRole.EMPLOYEE}});
    }

    async create(body: CreateEmployeeDto){
        const [department, position, technologies, isExist] = await Promise.all([
            this.departmentService.findOne({id:body.departmentId}),
            this.positionService.findOne({id:body.positionId}),
            this.technologyService.findByIds(body.technologies),
            this.accountRepo.findOne({filter:{email:body.email}}),
        ])
        if(isExist) throw this.employeeError.throw(ErrorCode.EMPLOYEE_EXIST);
        const employee: Employee = {
            image: body.image,
            department,
            position,
            technologies,
            employmentType: body.employmentType,
            baseSalary: body.baseSalary,
        }
        const account: Account = {
            email: body.email,
            password: body.password,
            firstName: body.firstName,
            lastName: body.lastName,
            phoneNumber: body.phoneNumber,
            accountRole: AccountRole.EMPLOYEE,
            employee,
            isActive: true,
            isVerified: true,
        }

        await this.accountRepo.create({doc:{...account, status: EmployeeStatus.ACTIVE} as any});
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
        const technologies = await this.technologyService.findByIds(body.technologies);
        const employee: Employee = {
            image: body.image,
            department,
            position,
            technologies,
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
