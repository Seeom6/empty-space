import * as mongoose from "mongoose";
import { InjectConnection } from "@nestjs/mongoose";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ClientSession } from "mongoose";

import { AccountError } from "./account.error";
import {
  GetByCriteriaAccountResponse,
} from "../api/dto";
import { AccountRepository } from "../data/repository/account.repository";
import { UserService } from "../../user/services";
import { UpdateOwnerEmailDto } from "../api/dto/update-owner-email.dto";
import { GetAllAccountDto } from "../api/dto/get-all-account.dto";
import { RedisService } from "@Infrastructure/cache";
import { ErrorCode } from "@Common/error";
import { IHeaders, IParamsId, Pagination, QueryValue } from "@Package/api";
import { SingInDto } from "@Modules/auth/api/dto/request/singIn.dto";
import { AccountRole } from "../types/role.enum";
import { IAccount } from "../types/account.interface";
import { UpdateAccountRequestDto, UpdateMeRequestDto } from "../api/dto/update-account.dto";

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,

    private readonly accountError: AccountError,

    private readonly redisService: RedisService,

    // private readonly jwtService: JwtService,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    @InjectConnection() private readonly connection: mongoose.Connection,
  ) { }

  async findByPhone(phone: string, throwError = true){
    return await this.accountRepository.findOne({
      filter: {
        phoneNumber: phone,
      },
      error: throwError ? this.accountError.error(ErrorCode.INVALID_CREDENTIALS): null
    })
  }

  async updateByPhone(phoneNumber: string, update: any, options?: { session?: mongoose.ClientSession }) {
    await this.accountRepository.findOneAndUpdate({
      filter: { phoneNumber },
      update,
      error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
      options,
    });
  }

  async findByUsername(username: string) {
    const projection = "-createdAt -updatedAt -__v";
    return await this.accountRepository.findOne({
      filter: { username, isActive: true },
      projection,
      error: this.accountError.error(ErrorCode.LOG_IN_FAILED),
    });
  }

  async findById(id: string | mongoose.Types.ObjectId) {
    return await this.accountRepository.findOne({
      filter: { _id: id, isActive: true },
      error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
    });
  }

  async findByEmail(email: string, throwError = true) {
    const projection = "-createdAt -updatedAt -__v";
    const account = await this.accountRepository.findOne({
      filter: {
        email,
        type: { $nin: [AccountRole.SUPER_ADMIN, AccountRole.OPERATOR] },
      },
      projection,
      error: throwError ?this.accountError.error(ErrorCode.LOG_IN_FAILED) : null,
    });

    // if (!account.isActive) {
    //   this.accountError.error(ErrorCode.ACCOUNT_NOT_ACTIVE)
    // }
    return account;
  }

  async update({ id }: IParamsId, accountUpdate: UpdateAccountRequestDto) {
    const session = await this.connection.startSession();
    await session.withTransaction(async (session) => {
      switch (accountUpdate.isConfirmed) {
        case true: {
          await this.accountRepository.findOneAndUpdate({
            filter: { isConfirmed: false, _id: id },
            update: accountUpdate,
            options: { session },
            error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
          });
          break;
        }
        case false: {
          const account = await this.accountRepository.findOneAndDelete({
            filter: { _id: id, isConfirmed: false },
            options: { session },
            error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
          });
          let userData;

          break;
        }
      }
    });
    return;
  }

  async findAllPendingRequest(
    criteria: { searchValue?: string; type: string },
    { limit, skip, total, needPagination }: Pagination,
    { languageKey }: IHeaders,
  ) {
    const conditions = (() => {
      const result = {};
      if (criteria.searchValue) {
        result["$or"] = [
          { fullName: new RegExp(`${criteria["searchValue"]}`, "i") },
        ];
      }
      result["isConfirmed"] = false;
      if (criteria.type) result["type"] = criteria.type;
      return result;
    })();

    const options: {
      limit?: number;
      skip?: number;
      populate?: { model: any; path: string };
    } = {};

    if (needPagination) {
      options.limit = limit;
      options.skip = skip;
    }
    const projection = "";

    const queries: Promise<any>[] = [];

    queries.push(
      this.accountRepository.find({
        filter: conditions,
        projection,
        options: {
          ...options,
        },
      }),
    );
    if (total) {
      queries.push(
        this.accountRepository.countDocuments({ filter: conditions }),
      );
    }

    const [accounts, totalRecords = undefined] = await Promise.all(queries);

    return {
      totalRecords,
      data: accounts.map((account) =>
        new GetByCriteriaAccountResponse({
          account,
          languageKey,
        }).toObject(),
      ),
    };
  }

  async checkAccount({ email }:  {email: string}) {
    const projection = "-createdAt -updatedAt -__v";
    const account = await this.accountRepository.findOne({
      filter: { email: email.toLowerCase() },
      projection,
      error: this.accountError.error(ErrorCode.DUPLICATED_EMAIL),
      options: {},
    });
    if (account) {
      this.accountError.error(ErrorCode.DUPLICATED_EMAIL)
    }
    return { data: { result: true } };
  }

  async checkPhoneNumber({ phoneNumber }: {phoneNumber: string}) {
    const projection = "-createdAt -updatedAt -__v";
    const account = await this.accountRepository.findOne({
      filter: { phoneNumber: phoneNumber },
      projection,
      error: this.accountError.error(ErrorCode.DUPLICATED_PHONE_NUMBER),
      options: {},
    });
    if (account) {
      this.accountError.error(ErrorCode.DUPLICATED_PHONE_NUMBER)
    }
    return { data: { result: true } };
  }

  async accountIsExist({ email }: {email: string}) {
    const projection = "-createdAt -updatedAt -__v";
    await this.accountRepository.findOne({
      filter: { email: email },
      projection,
      error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
      options: {},
    });
    return;
  }

  async forgetPasswordChangPassword(email, password) {
    let result;
    const session = await this.connection.startSession();
    await session.withTransaction(async (session) => {
      result = await this.accountRepository.findOneAndUpdate({
        filter: { email },
        update: { password },
        options: { session },
        error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
      });
    });
    return;
  }

  async changeEmail({ id, email }: { id: string; email: string }) {
    const session = await this.connection.startSession();
    await session.withTransaction(async (session: ClientSession) => {
      const queries = [];
      queries.push(
        this.accountRepository.findByIdAndUpdate({
          id,
          error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
          update: { email },
          options: {session}
        }),
      );
      queries.push();
      queries.push();
    });
    return;
  }

  async createAccount(body: SingInDto, options?: {session?: ClientSession,}) {
    const result = await this.accountRepository.create({
      doc: {        password: body.password,
        accountRole: body.accountRole as AccountRole || AccountRole.USER,
        phoneNumber: body.phoneNumber,
        isActive: true,
        isVerified: false,
      },
      options,
    });
    return result;
  }

  async updateMe(body: any, user: IAccount) {
    const result = await this.accountRepository.findOneAndUpdate({
      filter: { _id: user.accountId },
      update: { phoneNumber: body.phoneNumber, email: body.email },
      error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
    });
      // await this.userService.update(result.user.toString(), body);

    return;
  }

  async updateOwnerEmailAndPassword(body: UpdateOwnerEmailDto) {
    await this.accountRepository.findOneAndUpdate({
      filter: {
        email: body.oldEmail,
      },
      update: {
        email: body.newEmail,
      },
      error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
    });
    if (body.password) {
      await this.accountRepository.findOneAndUpdate({
        filter: {
          email: body.newEmail,
        },
        update: {
          password: body.password,
        },
        error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
      });
    }
  }

  async getAllAccount(query?: QueryValue<GetAllAccountDto>, pagination?: Pagination) {
    const { accountType } = query;
    let lookup: any = {};
    if (accountType === "user") {
      lookup = [
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $addFields: {
            user: { $first: "$user" },
          },
        },
      ];
    } else if (accountType === "company") {
      lookup = [
        {
          $lookup: {
            from: "companies",
            localField: "company",
            foreignField: "_id",
            as: "company",
          },
        },
        {
          $addFields: {
            company: { $first: "$company" },
          },
        },
      ];
    }
    const paginationStages = [];
    if (pagination.needPagination) {
      paginationStages.push(
        ...[
          {
            $skip: pagination.skip,
          },
          {
            $limit: pagination.limit,
          },
        ]
      );
    }
    const searchStages = [];
    if (query.searchValue) {
      searchStages.push(
        ...[
          {
            $match: {
              $or: [
                {
                  "user.fullName": { $regex: query.searchValue, $options: "i" },
                },
                {
                  "company.companyFullName": {
                    $regex: query.searchValue,
                    $options: "i",
                  },
                },
                { email: { $regex: query.searchValue, $options: "i" } },
              ],
            },
          },
        ]
      );
    }
    const result = await this.accountRepository.aggregate({
      pipeline: [
        {
          $match: { type: AccountRole[accountType] },
        },
        ...paginationStages,
        ...lookup,
        ...searchStages,
        {
          $lookup: {
            from: "bookings",
            localField: "_id",
            foreignField: "accountId",
            pipeline: [
              {
                $sort: {
                  createdAt: -1,
                },
              },
            ],
            as: "lastBooking",
          },
        },
        {
          $addFields: {
            bookingCount: { $size: "$lastBooking" },
            lastBooking: { $first: "$lastBooking.createdAt" },
            isActive: "$isActive",
          },
        },
      ],
    });

    const total = await this.accountRepository.countDocuments({
      filter: { type: AccountRole[accountType] },
    });
    return {
      result,
      totalRecords: total,
      type: accountType,
    };
  }

  async activateAccount(id: string, body: { isActive: boolean }) {
    const account = await this.accountRepository.findOne({
      filter: { _id: id },
      error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
    });
    await this.accountRepository.findOneAndUpdate({
      filter: { _id: id },
      update: { isActive: body.isActive },
      error: this.accountError.error(ErrorCode.ACCOUNT_NOT_FOUND),
    });
    return;
  }

  async findByRole(id: string){
    const account  = await this.accountRepository.find({
      filter: {
        accountRole: id
      }
    })
    return account
  }
}
