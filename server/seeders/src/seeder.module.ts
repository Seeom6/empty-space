import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederService } from './seeder.service';
import { User, UserSchema } from './schemas/user.schema';
import { MongoConnection } from './database/mongodb/mongo.module';
import { EnvConfigModule } from './config';
import { Account, AccountSchema } from './schemas/account.shcema';
import { Role, RoleSchema } from './schemas/role.schema';
import { Privilege, PrivilegeSchema } from './schemas/privilege.schema';
import { Operator, OperatorSchema } from './schemas/operator.schema';

@Module({
  imports: [
    MongoConnection,
    EnvConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Privilege.name, schema: PrivilegeSchema },
      { name: Operator.name, schema: OperatorSchema }
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {} 