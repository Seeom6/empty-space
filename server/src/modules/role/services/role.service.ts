
import { Injectable } from "@nestjs/common";
import { RoleError } from "./role.error";
import { RoleRepository } from "../data/role.repository";
import { ErrorCode } from "../../../common/error/error-code";

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly roleError: RoleError,
  ) {}

  async findOne({
    _id = undefined,
    key = undefined,
  }: {
    _id?: string;
    key?: string;
  }) {
    const filter: { _id?: string; key?: string } = { _id, key };
    const role = await this.roleRepository.findOne({
      filter,
      error: this.roleError.error(ErrorCode.ROLE_NOT_FOUND),
    });
    return role;
  }

  async checkRoleIsExistAndGetKey(id: string) {
    const role = await this.roleRepository.findOne({
      filter: { _id: id },
      error: this.roleError.error(ErrorCode.ROLE_NOT_FOUND),
    });
    return role.key;
  }

  async getRoleIdByKey(key: string) {
    const role = await this.roleRepository.findOne({
      filter: { key },
      error: this.roleError.error(ErrorCode.ROLE_NOT_FOUND),
    });
    return role._id;
  }
}
