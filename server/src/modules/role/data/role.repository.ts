import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { RoleDocument, Role } from './role.schema';
import { BaseMongoRepository } from '@Infrastructure/database';

@Injectable()
export class RoleRepository extends BaseMongoRepository<Role> {
  constructor(
    @InjectModel(Role.name)
    roleModel: Model<RoleDocument>,
  ) {
    super(roleModel);
  }
}
