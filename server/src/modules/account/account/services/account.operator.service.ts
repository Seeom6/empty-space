import * as mongoose from "mongoose";
import { AccountError } from "./account.error";
import { AccountRepository } from "../data/repository/account.repository";
import {
  Injectable,
} from "@nestjs/common";

import { InjectConnection } from "@nestjs/mongoose";
import { AccountRole } from "../types/role.enum";
import { IAccount } from "../types/account.interface";
import { Operator } from "../data/schemas/operator.schema";
import { ErrorCode } from "@Common/error";
import { LocalFile } from "@Infrastructure/database";

@Injectable()
export class AccountOperatorService {
  constructor(
    private readonly accountRepository: AccountRepository,

    private readonly accountError: AccountError,

    // private readonly redisService: RedisService,

    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(
    user: IAccount,
    account: {
      operator: string;
      password: string;
      phoneNumber: string;
      username: string;
      accountRole?: AccountRole;
      role: string;
    },
    session: mongoose.ClientSession,
  ) {
    const accountData: any = await this.accountRepository.create({
      doc: {
        isActive: true,
        password: account.password,
        phoneNumber: account.phoneNumber,
        username: account.username,
        accountRole: account.accountRole,
      },
      options: { session },
    });
    return accountData._id;
  }

  async findOne(id: string) {
    const projection = "";
    const account = await this.accountRepository.findOne({
      filter: {
        _id: id,
        accountRole: { $in: [AccountRole.OPERATOR, AccountRole.SUPER_ADMIN] },
      },
      projection,
      error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
      options: {
        populate: [
          {
            path: "operator",
            model: Operator.name,
            select: "",
            populate: {
              select: "",
              model: LocalFile.name,
              path: "image",
            },
          }
        ],
      },
    });

    return account;
  }


  async remove(user: IAccount, id: string, session: mongoose.ClientSession) {
    if (user.accountId === id)
      this.accountError.error(ErrorCode.CAN_NOT_DELETE_YOUR_SELF)
    const conditions = (() => {
      const result = {
        $and: [],
      };
      result.$and.push({ _id: id });
      if (user.role !== AccountRole.SUPER_ADMIN)
        result.$and.push({ accountRole: { $ne: AccountRole.SUPER_ADMIN } });
      return result;
    })();

    const account = await this.accountRepository.findOneAndDelete({
      filter: conditions,
      error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
      options: { session },
    });

    return {
      id: account.operator,
      accountRole: account.accountRole,
    };
  }

  async getMe(user: IAccount) {
    const projection = "-createdAt -updatedAt -__v";
    const [account] = await Promise.all([
      this.accountRepository.findOne({
        filter: { _id: user.accountId },
        projection,
        options: {
          populate: [
            {
              select: "-_id -createdAt -updatedAt -__v",
              model: Operator.name,
              path: "operator",
              populate: {
                select: "",
                model: LocalFile.name,
                path: "image",
              },
            },
          ],
        },
        error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
      }),
    ]);
    return account;
  }

}
