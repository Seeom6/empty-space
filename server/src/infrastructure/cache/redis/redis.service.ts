import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { EnvironmentService } from "@Infrastructure/config";
import { TokenConstant } from "@Common/auth/token.constant";

@Injectable()
export class RedisService implements OnModuleDestroy {
    private redis: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor(
        private readonly envService: EnvironmentService
    ) {

    }

    async checkConnection(): Promise<boolean> {
        try {
            await this.redis.ping()
            return true
        } catch (error) {
            return false
        }
    }
    async connect(): Promise<void> {
        if (await this.checkConnection()) {
            return
        }
        this.redis = new Redis({
            username: this.envService.get("redis.username"),
            password: this.envService.get("redis.password"),
            host: this.envService.get("redis.host"),
            port: this.envService.get("redis.port"),
            db: this.envService.get("redis.databaseIndex"),
        });
        return new Promise((resolve, reject) => {
            this.redis.once('connect', () => {
                this.logger.log('Connected to Redis');
                resolve();
            });

            this.redis.once('error', (err) => {
                this.logger.error(`Redis connection error: ${err.message}`);
                reject(err);
            });
        });
    }
    async set(key: string, value: any, ttl?: number): Promise<void> {
        const val = typeof value === 'object' ? JSON.stringify(value) : value;
        await this.redis.set(key, val);
        if (ttl) {
            await this.redis.expire(key, ttl);
        }
    }

    async get<T = any>(key: string): Promise<T | null> {
        const val = await this.redis.get(key);
        try {
            return val ? JSON.parse(val) : null;
        } catch {
            return val as any;
        }
    }

        async hgetAll(key: string) {
        const val = await this.redis.hgetall(key);
        try {
            return val ?? null;
        } catch {
            return val as any;
        }
    }
    async del(key: string[]): Promise<number> {
        return this.redis.del(key);
    }

    async lpush(key: string, ...values: string[]): Promise<number> {
        return this.redis.lpush(key, ...values);
    }

    async lrange(key: string, start: number, end: number): Promise<string[]> {
        return this.redis.lrange(key, start, end);
    }

    async hset(key: string, field: string,  value: any): Promise<number> {
        const val = typeof value === 'object' ? JSON.stringify(value) : value;
        return this.redis.hset(key,field, val);
    }

    async hget(key: string, field: string): Promise<any> {
        const val = await this.redis.hget(key, field);
        try {
            return JSON.parse(val);
        } catch {
            return val;
        }
    }

    async exists(key: string): Promise<boolean> {
        return (await this.redis.exists(key)) === 1;
    }

    async ttl(key: string): Promise<number> {
        return this.redis.ttl(key);
    }

    async getByPattern(pattern: string): Promise<{ elements: string[] }> {
        const cursor = 0
        const result = await this.redis.scan(cursor, 'MATCH', `*${pattern}*`, 'COUNT', TokenConstant.MAX_USER_TOKEN_COUNT);
        return {
            elements: result[1]
        }
    }

    onModuleDestroy() {
        this.logger.log('👋 Disconnecting from Redis...');
        this.redis.disconnect();
        this.logger.log('🔌 Redis disconnected');
    }
}
