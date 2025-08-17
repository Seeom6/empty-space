import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { PrivilegeDocument, Privilege } from './privilege.schema';
import { BaseMongoRepository } from '@Infrastructure/database';

@Injectable()
export class PrivilegeRepository extends BaseMongoRepository<Privilege> {
  constructor(
    @InjectModel(Privilege.name)
    privilegeModel: Model<PrivilegeDocument>,
  ) {
    super(privilegeModel);
  }
}
