

import { AdminController, IHeaders, Headers, IParamsId, queryParser } from '@Package/api';


import { RoleDashboardApiService } from '../../services';
import { DeletePrivilege, GetPrivilege, PatchPrivilege, PostPrivilege } from '@Package/api/decorators/policy-method.decorator';
import { Body, Get, Param, Query } from '@nestjs/common';
import { CreateRoleRequestDto } from '../dto/create-role-request.dto';
import { UpdateRoleRequestDto } from '../dto/update-role-request.dto';
import { GetByCriteriaRoleRequestDto, GetByCriteriaRoleRequestValidation } from '../dto/get-by-criteria-request.dto';
import { createRoleRequestValidation } from '../dto/create-role-request.dto';
import { privilegeKeys } from '@Modules/shared/config/privilege';
@AdminController({
  prefix: 'role',
})
export class RoleDashboardController {
  constructor(
    private readonly roleService: RoleDashboardApiService,
  ) {}

  //######################### Create new Role  Api #########################

  @PostPrivilege({
    apiUrl: '',
    privilegeKeys: [privilegeKeys.createRole],
  })
  async create(@Body(createRoleRequestValidation) body: CreateRoleRequestDto) {
    return await this.roleService.create(body);
  }

  //######################### Update Role Api #########################

  @PatchPrivilege({
    apiUrl: ':id',
    privilegeKeys: [privilegeKeys.updateRole],
  })
  async update(@Param() paramsId: IParamsId, @Body() body: UpdateRoleRequestDto) {
    await this.roleService.update(paramsId, body);
    return;
  }

  //######################### Delete Role Api #########################
  @DeletePrivilege({
    apiUrl: ':id',
    privilegeKeys: [privilegeKeys.deleteRole],
  })
  async remove(@Param() paramsId: IParamsId) {
    return await this.roleService.remove(paramsId);
  }

  //######################### Get metadata Api #########################

  @Get('/metadata' )
  metaData() {
    const metadata = this.roleService.metadata();
    return metadata;
  }

  //######################### Get By Id Api #########################

  @GetPrivilege({
    apiUrl: ':id',
    privilegeKeys: [privilegeKeys.viewRole],
  })
  async findOne(@Param() paramsId: IParamsId, @Headers() headers: IHeaders) {
    const role = await this.roleService.findOne(paramsId, headers);
    return role;
  }

  //######################### Get By Criteria  Api #########################
  @GetPrivilege({
    apiUrl: '',
    privilegeKeys: [privilegeKeys.viewRole],
  })
  async findAll(
    @Headers() headers: IHeaders,
    @Query(GetByCriteriaRoleRequestValidation) query: GetByCriteriaRoleRequestDto,
  ) {
    const { pagination, myQuery } = queryParser(query);
    const roles = await this.roleService.findAll(myQuery, pagination, headers);
    return roles;
  }
}
