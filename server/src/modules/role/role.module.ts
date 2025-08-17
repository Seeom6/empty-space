import { Role, RoleSchema } from './data/role.schema';
import { RoleDashboardApiService, RoleService } from './services';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrivilegeModule } from '../privilege/privilege.module';
import { RoleDashboardController } from './api/controllers';
import { RoleError } from './services/role.error';
import { RoleRepository } from './data/role.repository';
import { LocalizationService } from '@Package/services/localization';
import { AccountModule } from '@Modules/account/account/account.module';

@Module({
  controllers: [RoleDashboardController],
  providers: [
    RoleRepository,
    RoleDashboardApiService,
    RoleError,
    RoleService,
    LocalizationService,
  ],
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    PrivilegeModule,
    forwardRef(() => AccountModule),
  ],
  exports: [RoleService],
})
export class RoleModule {}
