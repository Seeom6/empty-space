import { Global, Module } from "@nestjs/common";
import { BullModule } from '@nestjs/bullmq';
import { EnvironmentService } from "@Infrastructure/config";
import { SystemQueue } from "./queues";

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            inject:[EnvironmentService],
            useFactory: (env: EnvironmentService)=>{
                const host = env.get("redis.host")
                const port = env.get("redis.port")
                const databaseIndex = env.get("redis.databaseIndex")
                return {
                    connection: {
                        host: host,
                        port: port,
                        db: 0,
                    }, 
                    defaultJobOptions: {
                        removeOnComplete: 100,
                        removeOnFail: 200,
                    },
                    prefix: "BullMQ",
                }
            }
        }),
        ...SystemQueue
    ],
    exports: [BullModule]
})
export class QueueModule{}