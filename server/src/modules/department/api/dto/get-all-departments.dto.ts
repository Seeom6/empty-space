import { zodValidationPipeFactory } from "@Package/api";
import z from "zod";

/**
 * DTO for getting all departments with pagination, filtering, and sorting support
 */
const schema = z.object({
    // Pagination parameters
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    
    // Filtering parameters
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    search: z.string().trim().min(1).max(255).optional(),
    
    // Sorting parameters
    sortBy: z.enum(["name", "status", "createdAt", "updatedAt"]).optional().default("name"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
    
    // Include deleted departments (admin only)
    includeDeleted: z.coerce.boolean().optional().default(false)
});

export type GetAllDepartmentsDto = z.infer<typeof schema>;

export const GetAllDepartmentsDtoValidator = zodValidationPipeFactory(schema);

/**
 * Interface for pagination metadata
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Interface for paginated department response
 */
export interface PaginatedDepartmentsResponse {
    data: any[];
    meta: PaginationMeta;
}

/**
 * Interface for department filters
 */
export interface DepartmentFilters {
    status?: string;
    search?: string;
    includeDeleted?: boolean;
}

/**
 * Interface for department sorting
 */
export interface DepartmentSort {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}
