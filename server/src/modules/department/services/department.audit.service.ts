import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';

/**
 * Audit event types for department operations
 */
export enum DepartmentAuditAction {
    CREATED = 'DEPARTMENT_CREATED',
    UPDATED = 'DEPARTMENT_UPDATED',
    DELETED = 'DEPARTMENT_DELETED',
    RESTORED = 'DEPARTMENT_RESTORED',
    VIEWED = 'DEPARTMENT_VIEWED',
    LISTED = 'DEPARTMENTS_LISTED',
    SEARCH = 'DEPARTMENTS_SEARCHED'
}

/**
 * Audit event interface
 */
export interface DepartmentAuditEvent {
    id: string;
    action: DepartmentAuditAction;
    entityType: 'Department';
    entityId?: string;
    userId: string;
    userEmail?: string;
    userRole?: string;
    changes?: Record<string, any>;
    previousValues?: Record<string, any>;
    metadata?: Record<string, any>;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
}

/**
 * Department audit logging service
 * Tracks all department-related operations for compliance and monitoring
 */
@Injectable()
export class DepartmentAuditService {
    private readonly logger = new Logger(DepartmentAuditService.name);
    private readonly AUDIT_PREFIX = 'audit:department:';
    private readonly AUDIT_TTL = 86400 * 30; // 30 days in seconds

    constructor(private readonly redisService: RedisService) {}

    /**
     * Generate unique audit event ID
     * @returns Unique audit event ID
     */
    private generateAuditId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Log department audit event
     * @param event - Audit event data (without id and timestamp)
     */
    async logAuditEvent(
        event: Omit<DepartmentAuditEvent, 'id' | 'timestamp' | 'entityType'>
    ): Promise<void> {
        try {
            const auditEvent: DepartmentAuditEvent = {
                ...event,
                id: this.generateAuditId(),
                entityType: 'Department',
                timestamp: new Date()
            };

            // Store in Redis for quick access
            await this.storeAuditEvent(auditEvent);

            // Log for monitoring
            this.logger.log(
                `Audit: ${auditEvent.action} by user ${auditEvent.userId}${
                    auditEvent.entityId ? ` on department ${auditEvent.entityId}` : ''
                }`,
                {
                    auditId: auditEvent.id,
                    action: auditEvent.action,
                    userId: auditEvent.userId,
                    entityId: auditEvent.entityId,
                    requestId: auditEvent.requestId
                }
            );
        } catch (error) {
            this.logger.error(`Failed to log audit event: ${error.message}`, {
                action: event.action,
                userId: event.userId,
                entityId: event.entityId
            });
        }
    }

    /**
     * Store audit event in Redis
     * @param event - Complete audit event
     */
    private async storeAuditEvent(event: DepartmentAuditEvent): Promise<void> {
        try {
            // Store individual event
            const eventKey = `${this.AUDIT_PREFIX}event:${event.id}`;
            await this.redisService.set(eventKey, JSON.stringify(event), this.AUDIT_TTL);

            // Add to user's audit trail
            const userKey = `${this.AUDIT_PREFIX}user:${event.userId}`;
            await this.redisService.lpush(userKey, event.id);
            await this.redisService.expire(userKey, this.AUDIT_TTL);

            // Add to department's audit trail if entityId exists
            if (event.entityId) {
                const entityKey = `${this.AUDIT_PREFIX}entity:${event.entityId}`;
                await this.redisService.lpush(entityKey, event.id);
                await this.redisService.expire(entityKey, this.AUDIT_TTL);
            }

            // Add to daily audit log
            const dateKey = `${this.AUDIT_PREFIX}date:${event.timestamp.toISOString().split('T')[0]}`;
            await this.redisService.lpush(dateKey, event.id);
            await this.redisService.expire(dateKey, this.AUDIT_TTL);

        } catch (error) {
            this.logger.error(`Failed to store audit event: ${error.message}`);
        }
    }

    /**
     * Log department creation
     * @param departmentId - Created department ID
     * @param departmentData - Department data
     * @param userContext - User context
     * @param requestContext - Request context
     */
    async logDepartmentCreated(
        departmentId: string,
        departmentData: Record<string, any>,
        userContext: { userId: string; userEmail?: string; userRole?: string },
        requestContext?: { ipAddress?: string; userAgent?: string; requestId?: string }
    ): Promise<void> {
        await this.logAuditEvent({
            action: DepartmentAuditAction.CREATED,
            entityId: departmentId,
            userId: userContext.userId,
            userEmail: userContext.userEmail,
            userRole: userContext.userRole,
            changes: departmentData,
            metadata: {
                operation: 'create',
                success: true
            },
            ...requestContext
        });
    }

    /**
     * Log department update
     * @param departmentId - Updated department ID
     * @param changes - Changed data
     * @param previousValues - Previous values
     * @param userContext - User context
     * @param requestContext - Request context
     */
    async logDepartmentUpdated(
        departmentId: string,
        changes: Record<string, any>,
        previousValues: Record<string, any>,
        userContext: { userId: string; userEmail?: string; userRole?: string },
        requestContext?: { ipAddress?: string; userAgent?: string; requestId?: string }
    ): Promise<void> {
        await this.logAuditEvent({
            action: DepartmentAuditAction.UPDATED,
            entityId: departmentId,
            userId: userContext.userId,
            userEmail: userContext.userEmail,
            userRole: userContext.userRole,
            changes,
            previousValues,
            metadata: {
                operation: 'update',
                success: true,
                changedFields: Object.keys(changes)
            },
            ...requestContext
        });
    }

    /**
     * Log department deletion
     * @param departmentId - Deleted department ID
     * @param departmentData - Department data before deletion
     * @param userContext - User context
     * @param requestContext - Request context
     */
    async logDepartmentDeleted(
        departmentId: string,
        departmentData: Record<string, any>,
        userContext: { userId: string; userEmail?: string; userRole?: string },
        requestContext?: { ipAddress?: string; userAgent?: string; requestId?: string }
    ): Promise<void> {
        await this.logAuditEvent({
            action: DepartmentAuditAction.DELETED,
            entityId: departmentId,
            userId: userContext.userId,
            userEmail: userContext.userEmail,
            userRole: userContext.userRole,
            previousValues: departmentData,
            metadata: {
                operation: 'delete',
                success: true,
                deletionType: 'soft'
            },
            ...requestContext
        });
    }

    /**
     * Log department view
     * @param departmentId - Viewed department ID
     * @param userContext - User context
     * @param requestContext - Request context
     */
    async logDepartmentViewed(
        departmentId: string,
        userContext: { userId: string; userEmail?: string; userRole?: string },
        requestContext?: { ipAddress?: string; userAgent?: string; requestId?: string }
    ): Promise<void> {
        await this.logAuditEvent({
            action: DepartmentAuditAction.VIEWED,
            entityId: departmentId,
            userId: userContext.userId,
            userEmail: userContext.userEmail,
            userRole: userContext.userRole,
            metadata: {
                operation: 'view',
                success: true
            },
            ...requestContext
        });
    }

    /**
     * Log departments list access
     * @param filters - Applied filters
     * @param userContext - User context
     * @param requestContext - Request context
     */
    async logDepartmentsListed(
        filters: Record<string, any>,
        userContext: { userId: string; userEmail?: string; userRole?: string },
        requestContext?: { ipAddress?: string; userAgent?: string; requestId?: string }
    ): Promise<void> {
        await this.logAuditEvent({
            action: DepartmentAuditAction.LISTED,
            userId: userContext.userId,
            userEmail: userContext.userEmail,
            userRole: userContext.userRole,
            metadata: {
                operation: 'list',
                success: true,
                filters
            },
            ...requestContext
        });
    }

    /**
     * Get audit trail for a department
     * @param departmentId - Department ID
     * @param limit - Maximum number of events to return
     * @returns Array of audit events
     */
    async getDepartmentAuditTrail(
        departmentId: string,
        limit: number = 50
    ): Promise<DepartmentAuditEvent[]> {
        try {
            const entityKey = `${this.AUDIT_PREFIX}entity:${departmentId}`;
            const eventIds = await this.redisService.lrange(entityKey, 0, limit - 1);
            
            const events: DepartmentAuditEvent[] = [];
            for (const eventId of eventIds) {
                const eventKey = `${this.AUDIT_PREFIX}event:${eventId}`;
                const eventData = await this.redisService.get<string>(eventKey);
                if (eventData) {
                    events.push(JSON.parse(eventData));
                }
            }
            
            return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (error) {
            this.logger.error(`Failed to get audit trail for department ${departmentId}: ${error.message}`);
            return [];
        }
    }

    /**
     * Get audit trail for a user
     * @param userId - User ID
     * @param limit - Maximum number of events to return
     * @returns Array of audit events
     */
    async getUserAuditTrail(
        userId: string,
        limit: number = 50
    ): Promise<DepartmentAuditEvent[]> {
        try {
            const userKey = `${this.AUDIT_PREFIX}user:${userId}`;
            const eventIds = await this.redisService.lrange(userKey, 0, limit - 1);
            
            const events: DepartmentAuditEvent[] = [];
            for (const eventId of eventIds) {
                const eventKey = `${this.AUDIT_PREFIX}event:${eventId}`;
                const eventData = await this.redisService.get<string>(eventKey);
                if (eventData) {
                    events.push(JSON.parse(eventData));
                }
            }
            
            return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (error) {
            this.logger.error(`Failed to get audit trail for user ${userId}: ${error.message}`);
            return [];
        }
    }
}
