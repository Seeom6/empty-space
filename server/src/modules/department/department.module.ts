import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Department, DepartmentSchema } from "./data/department.schema";
import {
    DepartmentAdminService,
    DepartmentError,
    DepartmentCacheService,
    DepartmentAuditService,
    DepartmentMetricsService
} from "./services";
import { DepartmentRepo } from "./data/department.repository";
import {
    CreateDepartmentDtoValidator,
    UpdateDepartmentDtoValidator,
    GetAllDepartmentsDtoValidator
} from "./api/dto";
import { DepartmentAdminController } from "./api/controllers/department.admin.controller";
import { RedisModule } from "@Infrastructure/cache";

/**
 * Enhanced Department Module with caching, audit logging, and performance optimizations
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Department.name, schema: DepartmentSchema },
        ]),
        RedisModule, // Required for caching and audit services
    ],
    controllers: [DepartmentAdminController],
    providers: [
        // Core services
        DepartmentError,
        DepartmentAdminService,
        DepartmentRepo,

        // Enhanced services
        DepartmentCacheService,
        DepartmentAuditService,
        DepartmentMetricsService,

        // Validators
        CreateDepartmentDtoValidator,
        UpdateDepartmentDtoValidator,
        GetAllDepartmentsDtoValidator,
    ],
    exports: [
        DepartmentAdminService,
        DepartmentCacheService,
        DepartmentAuditService,
        DepartmentMetricsService
    ]
})
export class DepartmentModule {}