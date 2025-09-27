import { Injectable, Logger } from "@nestjs/common";
import { DepartmentError } from "./department.error";
import { DepartmentRepo } from "../data/department.repository";
import { IParamsId } from "@Package/api";
import { DepartmentStatus } from "../types/department-status.type";
import { ErrorCode } from "@Common/error";
import { CreateDepartmentDto, UpdateDepartmentDto, GetAllDepartmentsDto, DepartmentFilters } from "../api/dto";
import { DepartmentCacheService } from "./department.cache.service";
import { DepartmentAuditService } from "./department.audit.service";
import { DepartmentMetricsService } from "./department.metrics.service";
import { DepartmentDocument } from "../data/department.schema";

/**
 * Enhanced Department Admin Service with caching, audit logging, and performance optimizations
 * Implements comprehensive CRUD operations with proper error handling and monitoring
 */
@Injectable()
export class DepartmentAdminService {
    private readonly logger = new Logger(DepartmentAdminService.name);

    constructor(
        private readonly departmentRepo: DepartmentRepo,
        private readonly departmentError: DepartmentError,
        private readonly cacheService: DepartmentCacheService,
        private readonly auditService: DepartmentAuditService,
        private readonly metricsService: DepartmentMetricsService
    ) {}

    /**
     * Get all departments with pagination, filtering, sorting, and caching
     * @param queryParams - Query parameters for pagination, filtering, and sorting
     * @param userContext - User context for audit logging
     * @param requestContext - Request context for audit logging
     * @returns Paginated departments with metadata
     */
    async findAll(
        queryParams: GetAllDepartmentsDto = {} as GetAllDepartmentsDto,
        userContext?: { userId: string; userEmail?: string; userRole?: string },
        requestContext?: { ipAddress?: string; userAgent?: string; requestId?: string }
    ): Promise<{ departments: DepartmentDocument[]; total: number }> {
        const startTime = Date.now();

        try {
            const {
                page = 1,
                limit = 20,
                status,
                search,
                sortBy = 'name',
                sortOrder = 'asc',
                includeDeleted = false
            } = queryParams;

            // Build filters
            const filters: DepartmentFilters = {
                status,
                search,
                includeDeleted
            };

            // Generate cache key
            const cacheKey = this.cacheService.generateCacheKey({
                filters,
                page,
                limit,
                sortBy,
                sortOrder
            });

            // Try to get from cache first
            const cached = await this.cacheService.getCachedDepartmentsList(cacheKey);
            if (cached) {
                const duration = Date.now() - startTime;
                this.logger.debug(`Cache hit for departments list - ${duration}ms`);

                // Record metrics for cached access
                await this.metricsService.recordListMetric(
                    duration,
                    true,
                    true,
                    cached.departments.length,
                    userContext?.userId
                );

                // Log audit event for cached access
                if (userContext) {
                    await this.auditService.logDepartmentsListed(
                        { ...filters, page, limit, sortBy, sortOrder, cached: true },
                        userContext,
                        requestContext
                    );
                }

                return cached;
            }

            // Build database query
            const query = this.buildFindAllQuery(filters);
            const sort = this.buildSortQuery(sortBy, sortOrder);
            const skip = (page - 1) * limit;

            // Execute optimized queries in parallel
            const [departments, total] = await Promise.all([
                this.departmentRepo.find({
                    filter: query,
                    projection: this.getOptimizedProjection(),
                    options: {
                        skip,
                        limit,
                        sort,
                        lean: true
                    }
                }),
                this.departmentRepo.countDocuments({ filter: query })
            ]);

            const result = { departments, total };

            // Cache the result
            await this.cacheService.cacheDepartmentsList(cacheKey, result);

            const duration = Date.now() - startTime;

            // Record metrics for database access
            await this.metricsService.recordListMetric(
                duration,
                true,
                false,
                result.departments.length,
                userContext?.userId
            );

            // Log audit event
            if (userContext) {
                await this.auditService.logDepartmentsListed(
                    { ...filters, page, limit, sortBy, sortOrder, cached: false },
                    userContext,
                    requestContext
                );
            }

            this.logger.debug(`Database query for departments list - ${duration}ms`);
            return result;

        } catch (error) {
            const duration = Date.now() - startTime;

            // Record error metrics
            await this.metricsService.recordListMetric(
                duration,
                false,
                false,
                0,
                userContext?.userId,
                error.constructor.name
            );

            this.logger.error(`Error in findAll: ${error.message}`, {
                queryParams,
                userId: userContext?.userId,
                requestId: requestContext?.requestId,
                duration
            });
            throw error;
        }
    }

    /**
     * Find a single department by ID with caching and audit logging
     * @param paramsId - Department ID parameters
     * @param userContext - User context for audit logging
     * @param requestContext - Request context for audit logging
     * @returns Department document
     */
    async findOne(
        paramsId: IParamsId,
        userContext?: { userId: string; userEmail?: string; userRole?: string },
        requestContext?: { ipAddress?: string; userAgent?: string; requestId?: string }
    ): Promise<DepartmentDocument> {
        const startTime = Date.now();

        try {
            // Try cache first
            const cached = await this.cacheService.getCachedDepartment(paramsId.id);
            if (cached && !cached.isDeleted) {
                const duration = Date.now() - startTime;
                this.logger.debug(`Cache hit for department ${paramsId.id} - ${duration}ms`);

                // Record metrics for cached access
                await this.metricsService.recordGetMetric(
                    duration,
                    true,
                    true,
                    userContext?.userId
                );

                // Log audit event for cached access
                if (userContext) {
                    await this.auditService.logDepartmentViewed(
                        paramsId.id,
                        userContext,
                        requestContext
                    );
                }

                return cached;
            }

            // Query database with optimized projection
            const department = await this.departmentRepo.findOne({
                filter: { _id: paramsId.id, isDeleted: false },
                projection: this.getDetailedProjection(),
                error: this.departmentError.error(ErrorCode.DEPARTMENT_NOT_FOUND)
            });

            // Cache the result
            await this.cacheService.cacheDepartment(paramsId.id, department);

            const duration = Date.now() - startTime;

            // Record metrics for database access
            await this.metricsService.recordGetMetric(
                duration,
                true,
                false,
                userContext?.userId
            );

            // Log audit event
            if (userContext) {
                await this.auditService.logDepartmentViewed(
                    paramsId.id,
                    userContext,
                    requestContext
                );
            }

            this.logger.debug(`Database query for department ${paramsId.id} - ${duration}ms`);
            return department;

        } catch (error) {
            const duration = Date.now() - startTime;

            // Record error metrics
            await this.metricsService.recordGetMetric(
                duration,
                false,
                false,
                userContext?.userId,
                error.constructor.name
            );

            this.logger.error(`Error in findOne: ${error.message}`, {
                departmentId: paramsId.id,
                userId: userContext?.userId,
                requestId: requestContext?.requestId,
                duration
            });
            throw error;
        }
    }

    /**
     * Create a new department with proper validation, caching, and audit logging
     * @param body - Department creation data
     * @param userContext - User context for audit logging
     * @param requestContext - Request context for audit logging
     * @returns Created department document
     */
    async create(
        body: CreateDepartmentDto,
        userContext: { userId: string; userEmail?: string; userRole?: string },
        requestContext?: { ipAddress?: string; userAgent?: string; requestId?: string }
    ): Promise<DepartmentDocument> {
        const startTime = Date.now();

        try {
            // Check for existing department with optimized query
            const existingDepartment = await this.departmentRepo.findOne({
                filter: {
                    name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') },
                    isDeleted: false
                },
                projection: { _id: 1, name: 1 }
            });

            if (existingDepartment) {
                throw this.departmentError.throw(ErrorCode.DEPARTMENT_EXIST);
            }

            // Create department with proper typing
            const departmentData: Partial<DepartmentDocument> = {
                name: body.name.trim(),
                description: body.description?.trim() || undefined,
                status: body.status || DepartmentStatus.ACTIVE,
                isDeleted: false
            };

            const createdDepartment = await this.departmentRepo.create({
                doc: departmentData as any
            });

            // Invalidate cache
            await this.cacheService.invalidateDepartmentCache();

            const duration = Date.now() - startTime;

            // Record metrics
            await this.metricsService.recordCreateMetric(
                duration,
                true,
                userContext.userId
            );

            // Log audit event
            await this.auditService.logDepartmentCreated(
                createdDepartment._id,
                departmentData,
                userContext,
                requestContext
            );

            this.logger.log(`Department created: ${createdDepartment._id} by user ${userContext.userId}`, {
                departmentId: createdDepartment._id,
                departmentName: createdDepartment.name,
                userId: userContext.userId,
                requestId: requestContext?.requestId,
                duration
            });

            return createdDepartment;

        } catch (error) {
            const duration = Date.now() - startTime;

            // Record error metrics
            await this.metricsService.recordCreateMetric(
                duration,
                false,
                userContext.userId,
                error.constructor.name
            );

            this.logger.error(`Error in create: ${error.message}`, {
                departmentData: body,
                userId: userContext.userId,
                requestId: requestContext?.requestId,
                duration
            });
            throw error;
        }
    }

    /**
     * Update an existing department with proper validation, caching, and audit logging
     * @param paramsId - Department ID parameters
     * @param body - Department update data
     * @param userContext - User context for audit logging
     * @param requestContext - Request context for audit logging
     * @returns Updated department document
     */
    async update(
        paramsId: IParamsId,
        body: UpdateDepartmentDto,
        userContext: { userId: string; userEmail?: string; userRole?: string },
        requestContext?: { ipAddress?: string; userAgent?: string; requestId?: string }
    ): Promise<DepartmentDocument> {
        const startTime = Date.now();

        try {
            // Get current department with optimized projection
            const currentDepartment = await this.departmentRepo.findOne({
                filter: { _id: paramsId.id, isDeleted: false },
                error: this.departmentError.error(ErrorCode.DEPARTMENT_NOT_FOUND)
            });

            // Store previous values for audit
            const previousValues = {
                name: currentDepartment.name,
                description: currentDepartment.description,
                status: currentDepartment.status
            };

            // Check for name uniqueness if name is being changed
            if (body.name && body.name.trim() !== currentDepartment.name) {
                const existingDepartment = await this.departmentRepo.findOne({
                    filter: {
                        name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') },
                        _id: { $ne: paramsId.id },
                        isDeleted: false
                    },
                    projection: { _id: 1, name: 1 }
                });

                if (existingDepartment) {
                    throw this.departmentError.throw(ErrorCode.DEPARTMENT_EXIST);
                }
            }

            // Build update data with proper typing
            const updateData: Partial<DepartmentDocument> = {};

            if (body.name !== undefined) {
                updateData.name = body.name.trim();
            }

            if (body.description !== undefined) {
                updateData.description = body.description?.trim() || undefined;
            }

            if (body.status !== undefined) {
                updateData.status = body.status;
            }

            // Update department with $set operator for proper MongoDB update
            const updatedDepartment = await this.departmentRepo.findOneAndUpdate({
                filter: { _id: paramsId.id },
                update: { $set: updateData }
            });

            // Invalidate cache
            await this.cacheService.invalidateDepartmentCache(paramsId.id);

            const duration = Date.now() - startTime;

            // Record metrics
            await this.metricsService.recordUpdateMetric(
                duration,
                true,
                userContext.userId
            );

            // Log audit event
            await this.auditService.logDepartmentUpdated(
                paramsId.id,
                updateData,
                previousValues,
                userContext,
                requestContext
            );

            this.logger.log(`Department updated: ${paramsId.id} by user ${userContext.userId}`, {
                departmentId: paramsId.id,
                changes: updateData,
                userId: userContext.userId,
                requestId: requestContext?.requestId,
                duration
            });

            return updatedDepartment;

        } catch (error) {
            const duration = Date.now() - startTime;

            // Record error metrics
            await this.metricsService.recordUpdateMetric(
                duration,
                false,
                userContext.userId,
                error.constructor.name
            );

            this.logger.error(`Error in update: ${error.message}`, {
                departmentId: paramsId.id,
                updateData: body,
                userId: userContext.userId,
                requestId: requestContext?.requestId,
                duration
            });
            throw error;
        }
    }

    /**
     * Soft delete a department with proper validation, caching, and audit logging
     * @param paramsId - Department ID parameters
     * @param userContext - User context for audit logging
     * @param requestContext - Request context for audit logging
     * @returns Deleted department document
     */
    async remove(
        paramsId: IParamsId,
        userContext: { userId: string; userEmail?: string; userRole?: string },
        requestContext?: { ipAddress?: string; userAgent?: string; requestId?: string }
    ): Promise<void> {
        const startTime = Date.now();

        try {
            // Get department data before deletion for audit
            const department = await this.departmentRepo.findOne({
                filter: { _id: paramsId.id, isDeleted: false },
                error: this.departmentError.error(ErrorCode.DEPARTMENT_NOT_FOUND)
            });

            // Check for dependencies using optimized aggregation
            const dependencyCheck = await this.departmentRepo.aggregate({
                pipeline: [
                    {
                        $match: { _id: paramsId.id }
                    },
                    {
                        $lookup: {
                            from: "employees",
                            localField: "_id",
                            foreignField: "departmentId",
                            as: "employees",
                            pipeline: [
                                { $match: { isDeleted: { $ne: true } } },
                                { $limit: 1 },
                                { $project: { _id: 1 } }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "positions",
                            localField: "_id",
                            foreignField: "departmentId",
                            as: "positions",
                            pipeline: [
                                { $match: { isDeleted: { $ne: true } } },
                                { $limit: 1 },
                                { $project: { _id: 1 } }
                            ]
                        }
                    },
                    {
                        $project: {
                            hasEmployees: { $gt: [{ $size: "$employees" }, 0] },
                            hasPositions: { $gt: [{ $size: "$positions" }, 0] }
                        }
                    }
                ]
            });

            if (dependencyCheck.length === 0) {
                throw this.departmentError.throw(ErrorCode.DEPARTMENT_NOT_FOUND);
            }

            const { hasEmployees, hasPositions } = dependencyCheck[0];

            if (hasEmployees) {
                throw this.departmentError.throw(ErrorCode.DEPARTMENT_HAS_EMPLOYEE);
            }

            if (hasPositions) {
                throw this.departmentError.throw(ErrorCode.DEPARTMENT_HAS_POSITION);
            }

            // Perform soft delete
            await this.departmentRepo.findOneAndUpdate({
                filter: { _id: paramsId.id },
                update: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            });

            // Invalidate cache
            await this.cacheService.invalidateDepartmentCache(paramsId.id);

            const duration = Date.now() - startTime;

            // Record metrics
            await this.metricsService.recordDeleteMetric(
                duration,
                true,
                userContext.userId
            );

            // Log audit event
            await this.auditService.logDepartmentDeleted(
                paramsId.id,
                {
                    name: department.name,
                    description: department.description,
                    status: department.status
                },
                userContext,
                requestContext
            );

            this.logger.log(`Department deleted: ${paramsId.id} by user ${userContext.userId}`, {
                departmentId: paramsId.id,
                departmentName: department.name,
                userId: userContext.userId,
                requestId: requestContext?.requestId,
                duration
            });

        } catch (error) {
            const duration = Date.now() - startTime;

            // Record error metrics
            await this.metricsService.recordDeleteMetric(
                duration,
                false,
                userContext.userId,
                error.constructor.name
            );

            this.logger.error(`Error in remove: ${error.message}`, {
                departmentId: paramsId.id,
                userId: userContext.userId,
                requestId: requestContext?.requestId,
                duration
            });
            throw error;
        }
    }

    /**
     * Get department statistics with caching
     * @returns Department statistics
     */
    async getStatistics(): Promise<{ total: number; active: number; inactive: number }> {
        try {
            // Try cache first
            const cached = await this.cacheService.getCachedDepartmentStats();
            if (cached) {
                return cached;
            }

            // Calculate statistics using aggregation
            const stats = await this.departmentRepo.aggregate({
                pipeline: [
                    {
                        $match: { isDeleted: false }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            active: {
                                $sum: {
                                    $cond: [{ $eq: ["$status", DepartmentStatus.ACTIVE] }, 1, 0]
                                }
                            },
                            inactive: {
                                $sum: {
                                    $cond: [{ $eq: ["$status", DepartmentStatus.INACTIVE] }, 1, 0]
                                }
                            }
                        }
                    }
                ]
            });

            const result = stats[0] || { total: 0, active: 0, inactive: 0 };
            delete result._id;

            // Cache the result
            await this.cacheService.cacheDepartmentStats(result);

            return result;
        } catch (error) {
            this.logger.error(`Error getting department statistics: ${error.message}`);
            return { total: 0, active: 0, inactive: 0 };
        }
    }

    /**
     * Search departments by text
     * @param searchTerm - Search term
     * @param limit - Maximum results
     * @returns Array of matching departments
     */
    async searchDepartments(searchTerm: string, limit: number = 10): Promise<DepartmentDocument[]> {
        try {
            return await this.departmentRepo.find({
                filter: {
                    $text: { $search: searchTerm },
                    isDeleted: false
                },
                projection: this.getOptimizedProjection(),
                options: {
                    limit,
                    sort: { score: { $meta: "textScore" } },
                    lean: true
                }
            });
        } catch (error) {
            this.logger.error(`Error searching departments: ${error.message}`);
            return [];
        }
    }

    // Private helper methods

    /**
     * Build query for findAll method
     * @param filters - Applied filters
     * @returns MongoDB query object
     */
    private buildFindAllQuery(filters: DepartmentFilters): Record<string, any> {
        const query: Record<string, any> = {};

        // Always filter by isDeleted unless explicitly included
        if (!filters.includeDeleted) {
            query.isDeleted = false;
        }

        // Status filter
        if (filters.status) {
            query.status = filters.status;
        }

        // Search filter
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } }
            ];
        }

        return query;
    }

    /**
     * Build sort query
     * @param sortBy - Sort field
     * @param sortOrder - Sort order
     * @returns MongoDB sort object
     */
    private buildSortQuery(sortBy: string, sortOrder: string): Record<string, 1 | -1> {
        const order = sortOrder === 'desc' ? -1 : 1;
        return { [sortBy]: order };
    }

    /**
     * Get optimized projection for list queries
     * @returns MongoDB projection object
     */
    private getOptimizedProjection(): Record<string, 1> {
        return {
            _id: 1,
            name: 1,
            description: 1,
            status: 1,
            isDeleted: 1,
            createdAt: 1,
            updatedAt: 1
        };
    }

    /**
     * Get detailed projection for single document queries
     * @returns MongoDB projection object
     */
    private getDetailedProjection(): Record<string, 1> {
        return {
            _id: 1,
            name: 1,
            description: 1,
            status: 1,
            isDeleted: 1,
            createdAt: 1,
            updatedAt: 1
        };
    }
}