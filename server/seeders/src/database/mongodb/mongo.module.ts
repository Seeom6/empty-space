import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection} from "mongoose";
import { EnvironmentService } from '../../config';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            inject: [EnvironmentService],
            useFactory: async (env: EnvironmentService)=> {
                const host: string = env.get('mongodb.host');
                const port: number = env.get('mongodb.port');
                const username: string = env.get('mongodb.username');
                const password: string = env.get('mongodb.password');
                const database: string = env.get('mongodb.name');
                const uri = username && password
                    ? `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin&replicaSet=rs0`
                    : `mongodb://${host}:${port}/${database}`;

                // const uri = `mongodb://127.0.0.1:27027/silla_link`;
                // const uri = `mongodb://${host}:27017/${database}`;
                const logger = new Logger('MongoDB');
                logger.verbose(uri)
                return {
                    uri,
                    connectionFactory: (connection: Connection, name: string) => {
                        connection.on('connected', () => {
                            logger.log('Successfully connected to MongoDB', name);
                        });
                        connection.on('error', (err) => {
                            logger.error('MongoDB connection error:', err);
                        });
                        connection.on('disconnected', () => {
                            logger.warn('MongoDB disconnected');
                        });
                        connection.plugin((schema: any) => {
                            schema.options.toJSON = {
                                virtuals: true,
                                versionKey: false,
                                transform(doc: any, ret: any) {
                                    if (ret.password) delete ret.password;
                                    ret.id = ret._id;
                                    delete ret._id;
                                },
                            };
                            schema.options.toObject = {
                                virtuals: true,
                                versionKey: false,
                                transform(doc: any, ret: any) {
                                    if (ret.password) delete ret.password;
                                    delete ret._id;
                                },
                            };
                        });
                        return connection;
                    },
                };
            },
        })
    ]
})
export class MongoConnection {
}
