import { BullModule } from '@nestjs/bullmq';
import { QueuesNames } from '../types/queue.type';

export const securityEventsQueue = BullModule.registerQueue({
  name: QueuesNames.SECURITY_EVENTS,
});
