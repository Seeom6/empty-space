import { Injectable } from '@nestjs/common';
import { PrivilegeDocument } from '../data/privilege.schema';
import { PrivilegeError } from './privilege.error';
import { PrivilegeRepository } from '../data/privilege.repository';
import { ErrorCode } from '@Common/error';

@Injectable()
export class PrivilegeService {
  constructor(
    private readonly privilegeRepository: PrivilegeRepository,
    private readonly privilegeError: PrivilegeError,
  ) {}

  async findByIds({
    privilegesIds,
  }: {
    privilegesIds: string[];
  }): Promise<PrivilegeDocument[]> {
    const privileges = await this.privilegeRepository.find({
      filter: { _id: { $in: privilegesIds } },
      options: { lean: true },
    });
    if (privileges.length !== privilegesIds.length) {
      this.privilegeError.throw(ErrorCode.PRIVILEGE_NOT_FOUND);
    }
    return privileges;
  }

  async findAll(): Promise<PrivilegeDocument[]> {
    const privileges = await this.privilegeRepository.find({});
    return privileges;
  }
}
