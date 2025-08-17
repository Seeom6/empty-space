
import { Injectable } from "@nestjs/common";
import { OperatorError } from "./operator.error";
import { InjectConnection } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { RedisService } from "@Infrastructure/cache";
@Injectable()
export class OperatorService {
  constructor(
    private readonly operatorError: OperatorError,
    private readonly redisService: RedisService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

}
