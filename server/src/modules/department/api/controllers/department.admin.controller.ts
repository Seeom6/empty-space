import { DepartmentAdminService, DepartmentMetricsService } from "@Modules/department/services";
import { Get, Post, Put, Delete, Param, Body, Query, Req, Logger } from "@nestjs/common";
import { AdminController, Account, AccountPayload } from "@Package/api";
import {
    CreateDepartmentDto,
    UpdateDepartmentDto,
    GetAllDepartmentsDto,
    CreateDepartmentDtoValidator,
    UpdateDepartmentDtoValidator,
    GetAllDepartmentsDtoValidator
} from "@Modules/department/api/dto";
import {
    createPaginatedDepartmentResponse,
    getDepartmentByIdDto
} from "../dto/response";
import { Request } from "express";

/**
 * Enhanced Department Admin Controller with performance optimizations,
 * caching, audit logging, and comprehensive error handling
 */
@AdminController({
    prefix: "department",
})
export class DepartmentAdminController {
    private readonly logger = new Logger(DepartmentAdminController.name);

    constructor(
        private readonly departmentAdminService: DepartmentAdminService,
        private readonly metricsService: DepartmentMetricsService,
    ) {}

    /**
     * Get all departments with pagination, filtering, and sorting
     * @param query - Query parameters for pagination, filtering, and sorting
     * @param user - Authenticated user information
     * @param req - Express request object
     * @returns Paginated departments response
     */
    @Get()
    async findAll(
        @Query(GetAllDepartmentsDtoValidator) query: GetAllDepartmentsDto,
        @Account() user: AccountPayload,
        @Req() req: Request
    ) {
        const startTime = Date.now();

        try {
            const userContext = {
                userId: user.accountId,
                userEmail: user.email,
                userRole: user.accountRole
            };

            const requestContext = {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req['requestId']
            };

            const result = await this.departmentAdminService.findAll(
                query,
                userContext,
                requestContext
            );

            const response = createPaginatedDepartmentResponse(
                result.departments,
                result.total,
                query.page || 1,
                query.limit || 20
            );

            this.logger.debug(`findAll completed in ${Date.now() - startTime}ms`, {
                userId: user.accountId,
                resultCount: result.departments.length,
                total: result.total,
                requestId: req['requestId']
            });

            return response;

        } catch (error) {
            this.logger.error(`Error in findAll: ${error.message}`, {
                query,
                userId: user.accountId,
                requestId: req['requestId'],
                duration: Date.now() - startTime
            });
            throw error;
        }
    }

    /**
     * Get a single department by ID
     * @param id - Department ID
     * @param user - Authenticated user information
     * @param req - Express request object
     * @returns Department details
     */
    @Get("/:id")
    async findOne(
        @Param("id") id: string,
        @Account() user: AccountPayload,
        @Req() req: Request
    ) {
        const startTime = Date.now();

        try {
            const userContext = {
                userId: user.accountId,
                userEmail: user.email,
                userRole: user.accountRole
            };

            const requestContext = {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req['requestId']
            };

            const department = await this.departmentAdminService.findOne(
                { id },
                userContext,
                requestContext
            );

            const response = getDepartmentByIdDto(department);

            this.logger.debug(`findOne completed in ${Date.now() - startTime}ms`, {
                departmentId: id,
                userId: user.accountId,
                requestId: req['requestId']
            });

            return response;

        } catch (error) {
            this.logger.error(`Error in findOne: ${error.message}`, {
                departmentId: id,
                userId: user.accountId,
                requestId: req['requestId'],
                duration: Date.now() - startTime
            });
            throw error;
        }
    }

    /**
     * Create a new department
     * @param body - Department creation data
     * @param user - Authenticated user information
     * @param req - Express request object
     * @returns Created department
     */
    @Post()
    async create(
        @Body(CreateDepartmentDtoValidator) body: CreateDepartmentDto,
        @Account() user: AccountPayload,
        @Req() req: Request
    ) {
        const startTime = Date.now();

        try {
            const userContext = {
                userId: user.accountId,
                userEmail: user.email,
                userRole: user.accountRole
            };

            const requestContext = {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req['requestId']
            };

            const department = await this.departmentAdminService.create(
                body,
                userContext,
                requestContext
            );

            this.logger.log(`Department created successfully`, {
                departmentId: department._id,
                departmentName: department.name,
                userId: user.accountId,
                requestId: req['requestId'],
                duration: Date.now() - startTime
            });

            return getDepartmentByIdDto(department);

        } catch (error) {
            this.logger.error(`Error in create: ${error.message}`, {
                body,
                userId: user.accountId,
                requestId: req['requestId'],
                duration: Date.now() - startTime
            });
            throw error;
        }
    }

    /**
     * Update an existing department
     * @param id - Department ID
     * @param body - Department update data
     * @param user - Authenticated user information
     * @param req - Express request object
     * @returns Updated department
     */
    @Put("/:id")
    async update(
        @Param("id") id: string,
        @Body(UpdateDepartmentDtoValidator) body: UpdateDepartmentDto,
        @Account() user: AccountPayload,
        @Req() req: Request
    ) {
        const startTime = Date.now();

        try {
            const userContext = {
                userId: user.accountId,
                userEmail: user.email,
                userRole: user.accountRole
            };

            const requestContext = {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req['requestId']
            };

            const department = await this.departmentAdminService.update(
                { id },
                body,
                userContext,
                requestContext
            );

            this.logger.log(`Department updated successfully`, {
                departmentId: id,
                changes: body,
                userId: user.accountId,
                requestId: req['requestId'],
                duration: Date.now() - startTime
            });

            return getDepartmentByIdDto(department);

        } catch (error) {
            this.logger.error(`Error in update: ${error.message}`, {
                departmentId: id,
                body,
                userId: user.accountId,
                requestId: req['requestId'],
                duration: Date.now() - startTime
            });
            throw error;
        }
    }

    /**
     * Soft delete a department
     * @param id - Department ID
     * @param user - Authenticated user information
     * @param req - Express request object
     * @returns Success response
     */
    @Delete("/:id")
    async remove(
        @Param("id") id: string,
        @Account() user: AccountPayload,
        @Req() req: Request
    ) {
        const startTime = Date.now();

        try {
            const userContext = {
                userId: user.accountId,
                userEmail: user.email,
                userRole: user.accountRole
            };

            const requestContext = {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req['requestId']
            };

            await this.departmentAdminService.remove(
                { id },
                userContext,
                requestContext
            );

            this.logger.log(`Department deleted successfully`, {
                departmentId: id,
                userId: user.accountId,
                requestId: req['requestId'],
                duration: Date.now() - startTime
            });

            return {
                message: 'Department deleted successfully',
                departmentId: id,
                deletedAt: new Date().toISOString()
            };

        } catch (error) {
            this.logger.error(`Error in remove: ${error.message}`, {
                departmentId: id,
                userId: user.accountId,
                requestId: req['requestId'],
                duration: Date.now() - startTime
            });
            throw error;
        }
    }

    /**
     * Get department statistics
     * @param user - Authenticated user information
     * @param req - Express request object
     * @returns Department statistics
     */
    @Get("/stats/overview")
    async getStatistics(
        @Account() user: AccountPayload,
        @Req() req: Request
    ) {
        const startTime = Date.now();

        try {
            const stats = await this.departmentAdminService.getStatistics();

            this.logger.debug(`getStatistics completed in ${Date.now() - startTime}ms`, {
                userId: user.accountId,
                requestId: req['requestId']
            });

            return {
                statistics: stats,
                generatedAt: new Date().toISOString()
            };

        } catch (error) {
            this.logger.error(`Error in getStatistics: ${error.message}`, {
                userId: user.accountId,
                requestId: req['requestId'],
                duration: Date.now() - startTime
            });
            throw error;
        }
    }

    /**
     * Get performance metrics for department operations
     * @param user - Authenticated user information
     * @param req - Express request object
     * @returns Performance metrics and summary
     */
    @Get("/metrics/performance")
    async getPerformanceMetrics(
        @Account() user: AccountPayload,
        @Req() req: Request
    ) {
        const startTime = Date.now();

        try {
            const [summary, allMetrics] = await Promise.all([
                this.metricsService.getPerformanceSummary(24),
                this.metricsService.getAllMetrics(24)
            ]);

            this.logger.debug(`getPerformanceMetrics completed in ${Date.now() - startTime}ms`, {
                userId: user.accountId,
                requestId: req['requestId']
            });

            return {
                summary,
                operationMetrics: allMetrics,
                generatedAt: new Date().toISOString(),
                timeRange: '24 hours'
            };

        } catch (error) {
            this.logger.error(`Error in getPerformanceMetrics: ${error.message}`, {
                userId: user.accountId,
                requestId: req['requestId'],
                duration: Date.now() - startTime
            });
            throw error;
        }
    }
}