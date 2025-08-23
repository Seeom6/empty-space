import { apiClient, apiRequest } from '../client';
import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '../types';

/**
 * Department API Service
 * Handles all CRUD operations for the Department system
 * Requires JWT authentication for all operations
 */
export class DepartmentService {
  private static readonly BASE_PATH = '/admin/department';

  /**
   * Get all departments
   * GET /admin/department
   */
  static async getAll(): Promise<Department[]> {
    return apiRequest(() => 
      apiClient.get<Department[]>(this.BASE_PATH)
    );
  }

  /**
   * Get department by ID
   * GET /admin/department/:id
   */
  static async getById(id: string): Promise<Department> {
    if (!id) {
      throw new Error('Department ID is required');
    }
    
    return apiRequest(() => 
      apiClient.get<Department>(`${this.BASE_PATH}/${id}`)
    );
  }

  /**
   * Create new department
   * POST /admin/department
   */
  static async create(data: CreateDepartmentRequest): Promise<Department> {
    // Validate required fields
    this.validateCreateRequest(data);
    
    return apiRequest(() => 
      apiClient.post<Department>(this.BASE_PATH, data)
    );
  }

  /**
   * Update existing department
   * PUT /admin/department/:id
   */
  static async update(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    if (!id) {
      throw new Error('Department ID is required');
    }
    
    // Validate required fields
    this.validateUpdateRequest(data);
    
    return apiRequest(() => 
      apiClient.put<Department>(`${this.BASE_PATH}/${id}`, data)
    );
  }

  /**
   * Delete department
   * DELETE /admin/department/:id
   * Note: Cannot delete if department has positions or employees
   */
  static async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('Department ID is required');
    }
    
    return apiRequest(() => 
      apiClient.delete(`${this.BASE_PATH}/${id}`)
    );
  }

  /**
   * Validate create department request
   */
  private static validateCreateRequest(data: CreateDepartmentRequest): void {
    // Name is required and must be 3-255 characters
    if (!data.name || data.name.trim() === '') {
      throw new Error('Department name is required');
    }
    
    if (data.name.length < 3 || data.name.length > 255) {
      throw new Error('Department name must be between 3 and 255 characters');
    }
    
    // Status validation (optional)
    if (data.status && !['ACTIVE', 'INACTIVE'].includes(data.status)) {
      throw new Error('Status must be either ACTIVE or INACTIVE');
    }
  }

  /**
   * Validate update department request
   */
  private static validateUpdateRequest(data: UpdateDepartmentRequest): void {
    // Name is required and must be 3-255 characters
    if (!data.name || data.name.trim() === '') {
      throw new Error('Department name is required');
    }
    
    if (data.name.length < 3 || data.name.length > 255) {
      throw new Error('Department name must be between 3 and 255 characters');
    }
    
    // Status validation (optional)
    if (data.status && !['ACTIVE', 'INACTIVE'].includes(data.status)) {
      throw new Error('Status must be either ACTIVE or INACTIVE');
    }
  }

  /**
   * Get active departments only
   * Helper method for filtering
   */
  static async getActive(): Promise<Department[]> {
    const departments = await this.getAll();
    return departments.filter(dept => 
      dept.status === 'ACTIVE' && !dept.isDeleted
    );
  }

  /**
   * Search departments by name or description
   * Helper method for searching
   */
  static async search(query: string): Promise<Department[]> {
    const departments = await this.getAll();
    const searchTerm = query.toLowerCase();
    
    return departments.filter(dept => 
      (dept.name.toLowerCase().includes(searchTerm) ||
       (dept.description && dept.description.toLowerCase().includes(searchTerm))) &&
      !dept.isDeleted
    );
  }

  /**
   * Check if department exists by name
   * Helper method for validation
   */
  static async existsByName(name: string, excludeId?: string): Promise<boolean> {
    try {
      const departments = await this.getAll();
      return departments.some(dept => 
        dept.name.toLowerCase() === name.toLowerCase() &&
        dept.id !== excludeId &&
        !dept.isDeleted
      );
    } catch {
      return false;
    }
  }

  /**
   * Get department statistics
   * Helper method for dashboard
   */
  static async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const departments = await this.getAll();
    const activeDepartments = departments.filter(dept => !dept.isDeleted);
    
    return {
      total: activeDepartments.length,
      active: activeDepartments.filter(dept => dept.status === 'ACTIVE').length,
      inactive: activeDepartments.filter(dept => dept.status === 'INACTIVE').length,
    };
  }

  /**
   * Bulk operations helper
   * Update multiple departments status
   */
  static async bulkUpdateStatus(
    departmentIds: string[], 
    status: 'ACTIVE' | 'INACTIVE'
  ): Promise<Department[]> {
    const updatePromises = departmentIds.map(async (id) => {
      const department = await this.getById(id);
      return this.update(id, {
        name: department.name,
        description: department.description,
        status,
      });
    });
    
    return Promise.all(updatePromises);
  }
}

export default DepartmentService;
