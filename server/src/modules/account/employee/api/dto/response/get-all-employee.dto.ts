import { AccountDocument } from "@Modules/account/account/data";
import { DepartmentDocument } from "@Modules/department/data/department.schema";
import { PositionDocument } from "@Modules/position/data/position.schema";
import { TechnologyDocument } from "@Modules/technology/data/technology.schema";
import { parsImageUrl } from "@Package/file";


export function getAllEmployeeDto(accounts: AccountDocument[]){
    return accounts.map((account) => {
        return {
        id: account._id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        phoneNumber: account.phoneNumber,
        department: (account.employee.department as DepartmentDocument).name,
        position: (account.employee.position as PositionDocument).name,
        technologies: (account.employee.technologies as TechnologyDocument[]).map((technology) => technology.name),
        employmentType: account.employee.employmentType,
        baseSalary: account.employee.baseSalary,
        image: parsImageUrl(account.image),
        isActive: account.isActive,
    }
    })
}