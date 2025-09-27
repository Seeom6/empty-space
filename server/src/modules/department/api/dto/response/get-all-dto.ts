import { DepartmentDocument } from "@Modules/department/data/department.schema";
import { PaginationMeta, PaginatedDepartmentsResponse } from "../get-all-departments.dto";

/**
 * Base department response transformation
 * @param department - Department document from database
 * @returns Formatted department response object
 */
function baseDepartmentResponse(department: DepartmentDocument) {
    return {
        id: department._id,
        name: department.name,
        description: department.description || null,
        status: department.status,
        isDeleted: department.isDeleted || false,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt
    };
}

/**
 * Transform array of department documents to response DTOs
 * @param departments - Array of department documents
 * @returns Array of formatted department response objects
 */
export function getAllDepartmentDto(departments: DepartmentDocument[]) {
    return departments.map(baseDepartmentResponse);
}

/**
 * Create paginated response for departments
 * @param departments - Array of department documents
 * @param total - Total count of departments
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Paginated response with metadata
 */
export function createPaginatedDepartmentResponse(
    departments: DepartmentDocument[],
    total: number,
    page: number,
    limit: number
): PaginatedDepartmentsResponse {
    const totalPages = Math.ceil(total / limit);

    return {
        data: getAllDepartmentDto(departments),
        meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
}

/**
 * Transform single department document to detailed response
 * @param department - Department document from database
 * @returns Detailed department response object with additional metadata
 */
export function getDepartmentByIdDto(department: DepartmentDocument) {
    return {
        ...baseDepartmentResponse(department),
        // Additional metadata for detailed view
        meta: {
            canDelete: !department.isDeleted,
            canUpdate: !department.isDeleted,
            lastModified: department.updatedAt
        }
    };
}