

import { AdminController, IHeaders, Headers } from '@Package/api';
import { PrivilegeDashboardApiService } from '../../services';
import { PrivilegeValidation } from '../validation';
import { GetPrivilege } from '@Package/api/decorators/policy-method.decorator';

@AdminController({
  prefix: 'privilege',
})
export class PrivilegeDashboardController {
  constructor(
    private readonly privilegeService: PrivilegeDashboardApiService,
  ) {}

  //######################### Get All Privilege Api #########################
  @GetPrivilege({
    apiUrl: '',
    privilegeKeys: PrivilegeValidation.policy().get,
  })
  async findAll(@Headers() headers: IHeaders) {
    const privileges: {
      data: {
        name: string;
        privileges: {
          id: string;
          action: string;
          description: string;
        }[];
      }[];
    } = await this.privilegeService.findAll(headers);
    return privileges;
  }
}
