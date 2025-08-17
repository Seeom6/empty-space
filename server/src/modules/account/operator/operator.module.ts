import { OperatorService } from './services';
import { Module, forwardRef } from '@nestjs/common';
import { OperatorDashboardController } from './api/controllers';
import { OperatorError } from './services/operator.error';
import { OperatorValidation } from './api/validation';
import { RedisModule } from '@Infrastructure/cache';
import { AccountModule } from '../account/account.module';

@Module({
  controllers: [OperatorDashboardController],
  providers: [
    OperatorService,
    OperatorError,
    OperatorValidation,
  ],
  imports: [
    forwardRef(() => AccountModule),
    RedisModule
  ],
  exports: [OperatorService],
})
export class OperatorModule {}
