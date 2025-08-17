
import { Injectable } from "@nestjs/common";
import { UserError } from "./user.error";
import { InjectConnection } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { IParamsId } from "@Package/api";
import { ErrorCode } from "../../../../common/error/error-code";
import { RedisService } from "@Infrastructure/cache";
@Injectable()
export class UserService {
  constructor(
    private readonly userError: UserError,
    private readonly redisService: RedisService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

}
