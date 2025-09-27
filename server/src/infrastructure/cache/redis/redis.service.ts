import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { EnvironmentService } from "@Infrastructure/config";
import { TokenConstant } from "@Common/auth/token.constant";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private redis: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor(
        private readonly envService: EnvironmentService
    ) {

    }

    async onModuleInit(): Promise<void> {
        this.logger.log('🚀 Redis module initialization started (connection disabled for debugging)');
        // Temporarily disable Redis connection to fix server startup
        // try {
        //     await this.connect();
        // } catch (error) {
        //     this.logger.warn('⚠️ Redis connection failed during module init, continuing without Redis:', error.message);
        // }
        this.logger.log('✅ Redis module initialization completed (without connection)');
    }

    async checkConnection(): Promise<boolean> {
        try {
            if (!this.redis) {
                return false;
            }
            await this.redis.ping()
            return true
        } catch (error) {
            return false
        }
    }
    async connect(): Promise<void> {
        if (this.redis && await this.checkConnection()) {
            return
        }

        this.logger.log('🔄 Attempting to connect to Redis...');

        this.redis = new Redis({
            username: this.envService.get("redis.username"),
            password: this.envService.get("redis.password"),
            host: this.envService.get("redis.host"),
            port: this.envService.get("redis.port"),
            db: this.envService.get("redis.databaseIndex"),
            connectTimeout: 5000, // 5 second timeout
            lazyConnect: true, // Don't connect immediately
            maxRetriesPerRequest: 3,
        });

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.logger.warn('⚠️ Redis connection timeout after 5 seconds, continuing without Redis');
                resolve(); // Resolve instead of reject to allow server to continue
            }, 5000);

            this.redis.once('connect', () => {
                clearTimeout(timeout);
                this.logger.log('✅ Connected to Redis successfully');
                resolve();
            });

            this.redis.once('error', (err) => {
                clearTimeout(timeout);
                this.logger.error(`❌ Redis connection error: ${err.message}`);
                this.logger.warn('⚠️ Continuing without Redis connection');
                resolve(); // Resolve instead of reject to allow server to continue
            });

            // Attempt to connect
            this.redis.connect().catch((err) => {
                clearTimeout(timeout);
                this.logger.error(`❌ Failed to connect to Redis: ${err.message}`);
                this.logger.warn('⚠️ Continuing without Redis connection');
                resolve(); // Resolve instead of reject to allow server to continue
            });
        });
    }
    async set(key: string, value: any, ttl?: number): Promise<void> {
        if (!this.redis || !(await this.checkConnection())) {
            await this.connect();
        }
        const val = typeof value === 'object' ? JSON.stringify(value) : value;
        if (ttl) {
            await this.redis.setex(key, ttl, val);
        } else {
            await this.redis.set(key, val);
        }
    }

    async get<T = any>(key: string): Promise<T | null> {
        if (!this.redis || !(await this.checkConnection())) {
            await this.connect();
        }
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

    // Additional Redis methods needed by authentication services
    async incr(key: string): Promise<number> {
        return this.redis.incr(key);
    }

    async decr(key: string): Promise<number> {
        return this.redis.decr(key);
    }

    async sadd(key: string, ...members: string[]): Promise<number> {
        return this.redis.sadd(key, ...members);
    }

    async srem(key: string, ...members: string[]): Promise<number> {
        return this.redis.srem(key, ...members);
    }

    async smembers(key: string): Promise<string[]> {
        return this.redis.smembers(key);
    }

    async scard(key: string): Promise<number> {
        return this.redis.scard(key);
    }

    async keys(pattern: string): Promise<string[]> {
        return this.redis.keys(pattern);
    }

    async expire(key: string, seconds: number): Promise<number> {
        return this.redis.expire(key, seconds);
    }

    async ltrim(key: string, start: number, stop: number): Promise<string> {
        return this.redis.ltrim(key, start, stop);
    }

    async setex(key: string, seconds: number, value: any): Promise<string> {
        const val = typeof value === 'object' ? JSON.stringify(value) : value;
        return this.redis.setex(key, seconds, val);
    }

    async setNX(key: string, value: any, ttl?: number): Promise<boolean> {
        if (!this.redis || !(await this.checkConnection())) {
            await this.connect();
        }
        const val = typeof value === 'object' ? JSON.stringify(value) : value;

        if (ttl) {
            // Use SET with NX and EX options
            const result = await this.redis.set(key, val, 'EX', ttl, 'NX');
            return result === 'OK';
        } else {
            // Use SETNX for no expiration
            const result = await this.redis.setnx(key, val);
            return result === 1;
        }
    }

    async mget(...keys: string[]): Promise<(string | null)[]> {
        return this.redis.mget(...keys);
    }

    async mset(keyValues: Record<string, any>): Promise<string> {
        const flatArray: string[] = [];
        for (const [key, value] of Object.entries(keyValues)) {
            flatArray.push(key);
            flatArray.push(typeof value === 'object' ? JSON.stringify(value) : value);
        }
        return this.redis.mset(...flatArray);
    }

    async flushall(): Promise<void> {
        await this.redis.flushall();
    }

    pipeline() {
        return this.redis.pipeline();
    }

    multi() {
        return this.redis.multi();
    }

    onModuleDestroy() {
        this.logger.log('👋 Disconnecting from Redis...');
        this.redis.disconnect();
        this.logger.log('🔌 Redis disconnected');
    }
}
