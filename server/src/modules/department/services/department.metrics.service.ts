import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';

/**
 * Performance metrics for department operations
 */
export interface DepartmentMetrics {
    operation: string;
    duration: number;
    timestamp: Date;
    userId?: string;
    success: boolean;
    errorType?: string;
    cacheHit?: boolean;
    resultCount?: number;
}

/**
 * Aggregated metrics for reporting
 */
export interface AggregatedMetrics {
    operation: string;
    totalRequests: number;
    averageDuration: number;
    successRate: number;
    cacheHitRate: number;
    errorBreakdown: Record<string, number>;
    timeRange: {
        start: Date;
        end: Date;
    };
}

/**
 * Department metrics and performance monitoring service
 * Tracks performance metrics for all department operations
 */
@Injectable()
export class DepartmentMetricsService {
    private readonly logger = new Logger(DepartmentMetricsService.name);
    private readonly METRICS_PREFIX = 'metrics:department:';
    private readonly METRICS_TTL = 86400 * 7; // 7 days in seconds

    constructor(private readonly redisService: RedisService) {}

    /**
     * Record a performance metric
     * @param metric - Performance metric data
     */
    async recordMetric(metric: DepartmentMetrics): Promise<void> {
        try {
            const metricId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const key = `${this.METRICS_PREFIX}${metric.operation}:${metricId}`;
            
            await this.redisService.set(key, JSON.stringify(metric), this.METRICS_TTL);
            
            // Add to operation-specific list for aggregation
            const operationKey = `${this.METRICS_PREFIX}list:${metric.operation}`;
            await this.redisService.lpush(operationKey, metricId);
            await this.redisService.expire(operationKey, this.METRICS_TTL);
            
            // Add to daily metrics for trending
            const dateKey = `${this.METRICS_PREFIX}daily:${metric.timestamp.toISOString().split('T')[0]}`;
            await this.redisService.lpush(dateKey, metricId);
            await this.redisService.expire(dateKey, this.METRICS_TTL);

            this.logger.debug(`Recorded metric for ${metric.operation}`, {
                operation: metric.operation,
                duration: metric.duration,
                success: metric.success,
                cacheHit: metric.cacheHit
            });

        } catch (error) {
            this.logger.error(`Failed to record metric: ${error.message}`, {
                operation: metric.operation,
                duration: metric.duration
            });
        }
    }

    /**
     * Record department list operation metric
     * @param duration - Operation duration in milliseconds
     * @param success - Whether operation was successful
     * @param cacheHit - Whether result came from cache
     * @param resultCount - Number of results returned
     * @param userId - User ID who performed the operation
     * @param errorType - Error type if operation failed
     */
    async recordListMetric(
        duration: number,
        success: boolean,
        cacheHit: boolean = false,
        resultCount?: number,
        userId?: string,
        errorType?: string
    ): Promise<void> {
        await this.recordMetric({
            operation: 'findAll',
            duration,
            timestamp: new Date(),
            userId,
            success,
            errorType,
            cacheHit,
            resultCount
        });
    }

    /**
     * Record department get operation metric
     * @param duration - Operation duration in milliseconds
     * @param success - Whether operation was successful
     * @param cacheHit - Whether result came from cache
     * @param userId - User ID who performed the operation
     * @param errorType - Error type if operation failed
     */
    async recordGetMetric(
        duration: number,
        success: boolean,
        cacheHit: boolean = false,
        userId?: string,
        errorType?: string
    ): Promise<void> {
        await this.recordMetric({
            operation: 'findOne',
            duration,
            timestamp: new Date(),
            userId,
            success,
            errorType,
            cacheHit,
            resultCount: success ? 1 : 0
        });
    }

    /**
     * Record department create operation metric
     * @param duration - Operation duration in milliseconds
     * @param success - Whether operation was successful
     * @param userId - User ID who performed the operation
     * @param errorType - Error type if operation failed
     */
    async recordCreateMetric(
        duration: number,
        success: boolean,
        userId?: string,
        errorType?: string
    ): Promise<void> {
        await this.recordMetric({
            operation: 'create',
            duration,
            timestamp: new Date(),
            userId,
            success,
            errorType,
            cacheHit: false,
            resultCount: success ? 1 : 0
        });
    }

    /**
     * Record department update operation metric
     * @param duration - Operation duration in milliseconds
     * @param success - Whether operation was successful
     * @param userId - User ID who performed the operation
     * @param errorType - Error type if operation failed
     */
    async recordUpdateMetric(
        duration: number,
        success: boolean,
        userId?: string,
        errorType?: string
    ): Promise<void> {
        await this.recordMetric({
            operation: 'update',
            duration,
            timestamp: new Date(),
            userId,
            success,
            errorType,
            cacheHit: false,
            resultCount: success ? 1 : 0
        });
    }

    /**
     * Record department delete operation metric
     * @param duration - Operation duration in milliseconds
     * @param success - Whether operation was successful
     * @param userId - User ID who performed the operation
     * @param errorType - Error type if operation failed
     */
    async recordDeleteMetric(
        duration: number,
        success: boolean,
        userId?: string,
        errorType?: string
    ): Promise<void> {
        await this.recordMetric({
            operation: 'remove',
            duration,
            timestamp: new Date(),
            userId,
            success,
            errorType,
            cacheHit: false,
            resultCount: success ? 1 : 0
        });
    }

    /**
     * Get aggregated metrics for an operation
     * @param operation - Operation name
     * @param hours - Number of hours to look back (default: 24)
     * @returns Aggregated metrics
     */
    async getOperationMetrics(
        operation: string,
        hours: number = 24
    ): Promise<AggregatedMetrics | null> {
        try {
            const operationKey = `${this.METRICS_PREFIX}list:${operation}`;
            const metricIds = await this.redisService.lrange(operationKey, 0, -1);
            
            if (metricIds.length === 0) {
                return null;
            }

            const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
            const metrics: DepartmentMetrics[] = [];
            
            for (const metricId of metricIds) {
                const key = `${this.METRICS_PREFIX}${operation}:${metricId}`;
                const metricData = await this.redisService.get<string>(key);
                
                if (metricData) {
                    const metric: DepartmentMetrics = JSON.parse(metricData);
                    if (new Date(metric.timestamp) >= cutoffTime) {
                        metrics.push(metric);
                    }
                }
            }

            if (metrics.length === 0) {
                return null;
            }

            // Calculate aggregated metrics
            const totalRequests = metrics.length;
            const successfulRequests = metrics.filter(m => m.success).length;
            const cacheHits = metrics.filter(m => m.cacheHit).length;
            const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
            
            const errorBreakdown: Record<string, number> = {};
            metrics.filter(m => !m.success && m.errorType).forEach(m => {
                errorBreakdown[m.errorType!] = (errorBreakdown[m.errorType!] || 0) + 1;
            });

            return {
                operation,
                totalRequests,
                averageDuration: totalDuration / totalRequests,
                successRate: (successfulRequests / totalRequests) * 100,
                cacheHitRate: (cacheHits / totalRequests) * 100,
                errorBreakdown,
                timeRange: {
                    start: cutoffTime,
                    end: new Date()
                }
            };

        } catch (error) {
            this.logger.error(`Failed to get operation metrics: ${error.message}`, {
                operation,
                hours
            });
            return null;
        }
    }

    /**
     * Get metrics for all operations
     * @param hours - Number of hours to look back (default: 24)
     * @returns Array of aggregated metrics for all operations
     */
    async getAllMetrics(hours: number = 24): Promise<AggregatedMetrics[]> {
        const operations = ['findAll', 'findOne', 'create', 'update', 'remove'];
        const results: AggregatedMetrics[] = [];

        for (const operation of operations) {
            const metrics = await this.getOperationMetrics(operation, hours);
            if (metrics) {
                results.push(metrics);
            }
        }

        return results;
    }

    /**
     * Get performance summary
     * @param hours - Number of hours to look back (default: 24)
     * @returns Performance summary
     */
    async getPerformanceSummary(hours: number = 24): Promise<{
        totalRequests: number;
        averageResponseTime: number;
        overallSuccessRate: number;
        overallCacheHitRate: number;
        slowestOperations: Array<{ operation: string; averageDuration: number }>;
        errorSummary: Record<string, number>;
    }> {
        try {
            const allMetrics = await this.getAllMetrics(hours);
            
            if (allMetrics.length === 0) {
                return {
                    totalRequests: 0,
                    averageResponseTime: 0,
                    overallSuccessRate: 0,
                    overallCacheHitRate: 0,
                    slowestOperations: [],
                    errorSummary: {}
                };
            }

            const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
            const weightedDuration = allMetrics.reduce((sum, m) => sum + (m.averageDuration * m.totalRequests), 0);
            const weightedSuccessRate = allMetrics.reduce((sum, m) => sum + (m.successRate * m.totalRequests), 0);
            const weightedCacheHitRate = allMetrics.reduce((sum, m) => sum + (m.cacheHitRate * m.totalRequests), 0);

            const errorSummary: Record<string, number> = {};
            allMetrics.forEach(m => {
                Object.entries(m.errorBreakdown).forEach(([error, count]) => {
                    errorSummary[error] = (errorSummary[error] || 0) + count;
                });
            });

            const slowestOperations = allMetrics
                .map(m => ({ operation: m.operation, averageDuration: m.averageDuration }))
                .sort((a, b) => b.averageDuration - a.averageDuration)
                .slice(0, 5);

            return {
                totalRequests,
                averageResponseTime: totalRequests > 0 ? weightedDuration / totalRequests : 0,
                overallSuccessRate: totalRequests > 0 ? weightedSuccessRate / totalRequests : 0,
                overallCacheHitRate: totalRequests > 0 ? weightedCacheHitRate / totalRequests : 0,
                slowestOperations,
                errorSummary
            };

        } catch (error) {
            this.logger.error(`Failed to get performance summary: ${error.message}`);
            return {
                totalRequests: 0,
                averageResponseTime: 0,
                overallSuccessRate: 0,
                overallCacheHitRate: 0,
                slowestOperations: [],
                errorSummary: {}
            };
        }
    }
}
