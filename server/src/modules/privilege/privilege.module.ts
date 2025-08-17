import { Privilege, PrivilegeSchema } from './data/privilege.schema';
import { PrivilegeDashboardApiService, PrivilegeService } from './services';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrivilegeDashboardController } from './api/controllers';
import { PrivilegeError } from './services/privilege.error';
import { PrivilegeRepository } from './data/privilege.repository';

@Module({
  controllers: [PrivilegeDashboardController],
  providers: [
    PrivilegeDashboardApiService,
    PrivilegeError,
    PrivilegeService,
    PrivilegeRepository,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: Privilege.name, schema: PrivilegeSchema },
    ]),
  ],
  exports: [PrivilegeService],
})
export class PrivilegeModule {}
