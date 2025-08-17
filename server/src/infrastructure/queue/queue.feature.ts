import { DynamicModule, Module } from '@nestjs/common';
import { BullModule, getQueueToken } from '@nestjs/bullmq';

@Module({})
export class QueueFeatureModule {

    static register(queueNames: string[]): DynamicModule {
        const imports = queueNames.map(name =>
            BullModule.registerQueue({ name }),
        );
        const exports = queueNames.map(name => getQueueToken(name));

        return {
            module: QueueFeatureModule,
            imports,
            exports,
        };
    }
}