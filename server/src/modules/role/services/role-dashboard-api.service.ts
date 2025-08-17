import {
  CreateRoleRequestDto,
  GetByCriteriaResponse,
  GetByCriteriaRoleRequestDto,
  GetByIdResponse,
  UpdateRoleRequestDto,
} from "../api/dto";
import {
  IHeaders,
  IParamsId,
  LocalizableString,
  Pagination,
  QueryValue,
} from "../../../package";
import { Role, RoleDocument } from "../data/role.schema";

import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { PrivilegeService } from "../../privilege/services";
import { RoleError } from "./role.error";
import { RoleRepository } from "../data/role.repository";
import { PrivilegeDocument } from "../../privilege/data/privilege.schema";
import { RedisService } from "@Infrastructure/cache";
import { AccountService } from "@Modules/account/account/services";
import { ErrorCode } from "@Common/error";
import { AccountRole } from "@Modules/account/account/types/role.enum";

@Injectable()
export class RoleDashboardApiService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly roleError: RoleError,
    private readonly privilegeService: PrivilegeService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService
  ) {}

  async create(role: CreateRoleRequestDto) {
    const privileges = await this.privilegeService.findByIds({
      privilegesIds: role?.privileges,
    });
    const doc: Role = {
      buildIn: false,
      name: role.name as LocalizableString,
      key: AccountRole.OPERATOR,
      privileges,
    };
    const result: any = await this.roleRepository.create({ doc });
    return { data: { id: result._id } };
  }

  async findAll(
    criteria: QueryValue<GetByCriteriaRoleRequestDto>,
    { limit, skip, total, needPagination }: Pagination,
    { languageKey }: IHeaders
  ): Promise<{
    totalRecords: number | undefined;
    data: {
      id: string;
      name: string;
      privileges: { id: string; name: string; key: string }[];
    };
  }> {
    const filter = (() => {
      const result = {};
      if (criteria.name) {
        const searchKey = `name.${languageKey}`;
        result[searchKey] = new RegExp(`${criteria.name}`, "i");
      }

      result["key"] = { $in: [AccountRole.OPERATOR, AccountRole.SUPER_ADMIN] };

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

    const projection = "_id name buildIn";

    const queries: Promise<any>[] = [];

    queries.push(
      this.roleRepository.find({
        filter,
        projection,
        options,
      })
    );
    if (total) {
      queries.push(this.roleRepository.countDocuments({ filter }));
    }

    const [roles, totalRecords = undefined] = await Promise.all(queries);

    return {
      totalRecords,
      data: roles.map((role: RoleDocument) =>
        new GetByCriteriaResponse({ role, languageKey }).toObject()
      ),
    };
  }

  async findOne({ id }: IParamsId, { languageKey }: IHeaders) {
    const [role, privileges] = await Promise.all([
      this.roleRepository.findOne({
        filter: { _id: id, buildIn: false },
        error: this.roleError.error(ErrorCode.ROLE_NOT_FOUND),
      }),
      this.privilegeService.findAll(),
    ]);
    return {
      data: new GetByIdResponse({ role, privileges, languageKey }).toObject(),
    };
  }

  //delete user and his privileges for redis
  async deleteUserFormCacheMemory(id: string) {
    const accounts: any = await this.accountService.findByRole(id);
    await Promise.all(    accounts.map(async (account) => {
      this.redisService.del([`${account?._id.toString()}`,`${account?.toString?.()}privileges`])
  })
)

  }

  async update({ id }: IParamsId, role: UpdateRoleRequestDto) {
    const update: {
      privileges?: PrivilegeDocument[] | string[];
      name?: LocalizableString;
    } = { ...role as any };

    if (role.privileges) {
      update.privileges = await this.privilegeService.findByIds({
        privilegesIds: role.privileges,
      });
    }
    await this.roleRepository.findOneAndUpdate({
      filter: { _id: id, buildIn: false },
      update: update,
      error: this.roleError.error(ErrorCode.ROLE_NOT_FOUND),
    });
    await this.deleteUserFormCacheMemory(id);
    return;
  }

  async remove({ id }: IParamsId) {
    await this.roleRepository.findOneAndDelete({
      filter: {
        _id: id,
        buildIn: false,
      },
      error: this.roleError.error(ErrorCode.ROLE_NOT_FOUND),
    });
    await this.deleteUserFormCacheMemory(id);
    return;
  }

  metadata() {
    return {
      errors: Object.values(this.roleError),
    };
  }
}
