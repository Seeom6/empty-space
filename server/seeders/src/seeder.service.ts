import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { account, operator, privilege, role } from './data';
import { Account, AccountDocument } from './schemas/account.shcema';
import { Role, RoleDocument } from './schemas/role.schema';
import { Privilege, PrivilegeDocument } from './schemas/privilege.schema';
import { Operator, OperatorDocument } from './schemas/operator.schema';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    @InjectModel(Privilege.name) private readonly privilegeModel: Model<PrivilegeDocument>,
    @InjectModel(Operator.name) private readonly operatorModel: Model<OperatorDocument>,
  ) {}


  async seed() {
    try {
      this.logger.log('Starting database seeding...');

      // await this.clearDatabase();

      // Seed users
      await this.accountSeed();
      await this.roleSeed()
      await this.privilegeSeed()
      await this.operationSeed()
      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Error seeding database:', error);
      throw error;
    }
  }

  private async clearDatabase() {
    this.logger.log('Clearing existing data...');
    await this.accountModel.deleteMany({});
    this.logger.log('Database cleared');
  }

  private async accountSeed() {
    this.logger.log('Seeding users...');
    const accounts = account.data;
    await this.accountModel.deleteMany({})
    await this.accountModel.insertMany(accounts);
    this.logger.log('accounts seeded successfully');
  }

    private async roleSeed() {
    this.logger.log('Seeding Role...');
    await this.roleModel.deleteMany({})
    await this.roleModel.insertMany(role.data);
    this.logger.log('Role seeded successfully');
  }

    private async privilegeSeed() {
    this.logger.log('Seeding privilege...');
    await this.privilegeModel.deleteMany({})
    await this.privilegeModel.insertMany(privilege.data);
    this.logger.log('privilege seeded successfully');
  }

    private async operationSeed() {
    this.logger.log('Seeding operator...');
    await this.operatorModel.deleteMany({})
    await this.operatorModel.insertMany(operator.data);
    this.logger.log('Operator seeded successfully');
  }
} 