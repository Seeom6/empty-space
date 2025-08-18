import { AccountDocument } from "@Modules/account/account/data";
import { parsImageUrl } from "@Package/file";


export function getAllEmployeeDto(account: AccountDocument){
    return {
        id: account._id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        phoneNumber: account.phoneNumber,
        department: account.employee.department,
        position: account.employee.position,
        employmentType: account.employee.employmentType,
        baseSalary: account.employee.baseSalary,
        image: parsImageUrl(account.image),
        isActive: account.isActive,
    }
}