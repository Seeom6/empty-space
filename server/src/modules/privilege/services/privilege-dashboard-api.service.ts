import { PrivilegeDocument } from '../data/privilege.schema';

import { IHeaders } from '../../../package';
import { GetByCriteriaResponse } from '../api/dto';
import { Injectable } from '@nestjs/common';
import { PrivilegeRepository } from '../data/privilege.repository';
import { groupBy } from 'lodash';

@Injectable()
export class PrivilegeDashboardApiService {
  constructor(private readonly privilegeRepository: PrivilegeRepository) {}

  async findAll({ languageKey }: IHeaders): Promise<{
    data: {
      name: string;
      privileges: {
        id: string;
        action: string;
        description: string;
      }[];
    }[];
  }> {
    const privileges = await this.privilegeRepository.find({
      filter: {},
    });

    const groupingPrivilege = groupBy(privileges, 'builtInRoleName.en');

    return {
      data: Object.values(groupingPrivilege).map(
        (privilegesGroup: PrivilegeDocument[]) =>
          new GetByCriteriaResponse({
            privilegesGroup,
            languageKey,
          }).toObject(),
      ),
    };
  }
}
