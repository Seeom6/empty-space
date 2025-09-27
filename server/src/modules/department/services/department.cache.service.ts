import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';
import { DepartmentDocument } from '../data/department.schema';

/**
 * Department caching service for improved performance
 * Handles Redis caching operations for department data
 */
@Injectable()
export class DepartmentCacheService {
    private readonly logger = new Logger(DepartmentCacheService.name);
    private readonly CACHE_PREFIX = 'department:';
    private readonly CACHE_TTL = 300; // 5 minutes in seconds

    constructor(private readonly redisService: RedisService) {}

    /**
     * Generate cache key for departments list
     * @param filters - Query filters
     * @param page - Page number
     * @param limit - Items per page
     * @param sortBy - Sort field
     * @param sortOrder - Sort order
     * @returns Cache key string
     */
    private generateListCacheKey(
        filters: Record<string, any> = {},
        page: number = 1,
        limit: number = 20,
        sortBy: string = 'name',
        sortOrder: string = 'asc'
    ): string {
        const filterString = Object.keys(filters)
            .sort()
            .map(key => `${key}:${filters[key]}`)
            .join('|');
        
        return `${this.CACHE_PREFIX}list:${filterString}:p${page}:l${limit}:s${sortBy}:o${sortOrder}`;
    }

    /**
     * Generate cache key for single department
     * @param departmentId - Department ID
     * @returns Cache key string
     */
    private generateSingleCacheKey(departmentId: string): string {
        return `${this.CACHE_PREFIX}single:${departmentId}`;
    }

    /**
     * Generate cache key for department statistics
     * @returns Cache key string
     */
    private generateStatsCacheKey(): string {
        return `${this.CACHE_PREFIX}stats`;
    }

    /**
     * Cache departments list
     * @param key - Cache key
     * @param data - Departments data to cache
     * @param ttl - Time to live in seconds (optional)
     */
    async cacheDepartmentsList(
        key: string,
        data: { departments: DepartmentDocument[]; total: number },
        ttl: number = this.CACHE_TTL
    ): Promise<void> {
        try {
            await this.redisService.set(key, JSON.stringify(data), ttl);
            this.logger.debug(`Cached departments list with key: ${key}`);
        } catch (error) {
            this.logger.error(`Failed to cache departments list: ${error.message}`);
        }
    }

    /**
     * Get cached departments list
     * @param key - Cache key
     * @returns Cached departments data or null
     */
    async getCachedDepartmentsList(
        key: string
    ): Promise<{ departments: DepartmentDocument[]; total: number } | null> {
        try {
            const cached = await this.redisService.get<string>(key);
            if (cached) {
                this.logger.debug(`Cache hit for departments list: ${key}`);
                return JSON.parse(cached);
            }
            this.logger.debug(`Cache miss for departments list: ${key}`);
            return null;
        } catch (error) {
            this.logger.error(`Failed to get cached departments list: ${error.message}`);
            return null;
        }
    }

    /**
     * Cache single department
     * @param departmentId - Department ID
     * @param department - Department data
     * @param ttl - Time to live in seconds (optional)
     */
    async cacheDepartment(
        departmentId: string,
        department: DepartmentDocument,
        ttl: number = this.CACHE_TTL
    ): Promise<void> {
        try {
            const key = this.generateSingleCacheKey(departmentId);
            await this.redisService.set(key, JSON.stringify(department), ttl);
            this.logger.debug(`Cached department: ${departmentId}`);
        } catch (error) {
            this.logger.error(`Failed to cache department: ${error.message}`);
        }
    }

    /**
     * Get cached department
     * @param departmentId - Department ID
     * @returns Cached department or null
     */
    async getCachedDepartment(departmentId: string): Promise<DepartmentDocument | null> {
        try {
            const key = this.generateSingleCacheKey(departmentId);
            const cached = await this.redisService.get<string>(key);
            if (cached) {
                this.logger.debug(`Cache hit for department: ${departmentId}`);
                return JSON.parse(cached);
            }
            this.logger.debug(`Cache miss for department: ${departmentId}`);
            return null;
        } catch (error) {
            this.logger.error(`Failed to get cached department: ${error.message}`);
            return null;
        }
    }

    /**
     * Cache department statistics
     * @param stats - Statistics data
     * @param ttl - Time to live in seconds (optional)
     */
    async cacheDepartmentStats(
        stats: { total: number; active: number; inactive: number },
        ttl: number = this.CACHE_TTL
    ): Promise<void> {
        try {
            const key = this.generateStatsCacheKey();
            await this.redisService.set(key, JSON.stringify(stats), ttl);
            this.logger.debug('Cached department statistics');
        } catch (error) {
            this.logger.error(`Failed to cache department stats: ${error.message}`);
        }
    }

    /**
     * Get cached department statistics
     * @returns Cached statistics or null
     */
    async getCachedDepartmentStats(): Promise<{ total: number; active: number; inactive: number } | null> {
        try {
            const key = this.generateStatsCacheKey();
            const cached = await this.redisService.get<string>(key);
            if (cached) {
                this.logger.debug('Cache hit for department statistics');
                return JSON.parse(cached);
            }
            this.logger.debug('Cache miss for department statistics');
            return null;
        } catch (error) {
            this.logger.error(`Failed to get cached department stats: ${error.message}`);
            return null;
        }
    }

    /**
     * Invalidate department cache
     * @param departmentId - Department ID (optional, if not provided, clears all department cache)
     */
    async invalidateDepartmentCache(departmentId?: string): Promise<void> {
        try {
            if (departmentId) {
                // Invalidate specific department cache
                const key = this.generateSingleCacheKey(departmentId);
                await this.redisService.del([key]);
                this.logger.debug(`Invalidated cache for department: ${departmentId}`);
            }
            
            // Always invalidate list cache and stats when any department changes
            await this.invalidateListCache();
            await this.invalidateStatsCache();
        } catch (error) {
            this.logger.error(`Failed to invalidate department cache: ${error.message}`);
        }
    }

    /**
     * Invalidate departments list cache
     */
    async invalidateListCache(): Promise<void> {
        try {
            const pattern = `${this.CACHE_PREFIX}list:*`;
            const keys = await this.redisService.keys(pattern);
            if (keys.length > 0) {
                await this.redisService.del(keys);
                this.logger.debug(`Invalidated ${keys.length} department list cache entries`);
            }
        } catch (error) {
            this.logger.error(`Failed to invalidate list cache: ${error.message}`);
        }
    }

    /**
     * Invalidate department statistics cache
     */
    async invalidateStatsCache(): Promise<void> {
        try {
            const key = this.generateStatsCacheKey();
            await this.redisService.del([key]);
            this.logger.debug('Invalidated department statistics cache');
        } catch (error) {
            this.logger.error(`Failed to invalidate stats cache: ${error.message}`);
        }
    }

    /**
     * Generate cache key for departments list with parameters
     * @param params - Query parameters
     * @returns Cache key
     */
    generateCacheKey(params: {
        filters?: Record<string, any>;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: string;
    }): string {
        return this.generateListCacheKey(
            params.filters,
            params.page,
            params.limit,
            params.sortBy,
            params.sortOrder
        );
    }
}
