import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { BaseMongoRepository } from "@Infrastructure/database";
import { Account, AccountDocument } from "../schemas/account.schema";

@Injectable()
export class AccountRepository extends BaseMongoRepository<Account> {
  constructor(
    @InjectModel(Account.name)
    accountModel: Model<AccountDocument>
  ) {
    super(accountModel);
  }
}
