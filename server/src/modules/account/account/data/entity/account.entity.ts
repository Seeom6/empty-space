import { AccountRole } from "../../types/role.enum";
import { IEmployee } from "./employee.entity";
import { IOperator } from "./operator.entity";
import { IUser } from "./user.schema";

    export interface IAccount {
        email?: string;

        username?: string;

        phoneNumber?: string;

        firstName?: string;

        lastName?: string;

        password: string;

        image?: string;

        isActive?: boolean;

        operator?: IOperator

        user?: IUser;

        employee?: IEmployee;

        accountRole: AccountRole;

        isVerified?: boolean;
    }

