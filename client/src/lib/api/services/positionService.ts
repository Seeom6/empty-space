import { apiClient, apiRequest } from '../client';
import {
  Position,
  PositionWithDepartment,
  CreatePositionRequest,
  UpdatePositionRequest,
} from '../types';

/**
 * Position API Service
 * Handles all CRUD operations for the Position system
 * Requires JWT authentication for all operations
 */
export class PositionService {
  private static readonly BASE_PATH = '/admin/position';

  /**
   * Get all positions
   * GET /admin/position
   */
  static async getAll(): Promise<Position[]> {
    return apiRequest(() => 
      apiClient.get<Position[]>(this.BASE_PATH)
    );
  }

  /**
   * Get position by ID (includes department name)
   * GET /admin/position/:id
   */
  static async getById(id: string): Promise<PositionWithDepartment> {
    if (!id) {
      throw new Error('Position ID is required');
    }
    
    return apiRequest(() => 
      apiClient.get<PositionWithDepartment>(`${this.BASE_PATH}/${id}`)
    );
  }

  /**
   * Create new position
   * POST /admin/position
   */
  static async create(data: CreatePositionRequest): Promise<Position> {
    // Validate required fields
    this.validateCreateRequest(data);
    
    return apiRequest(() => 
      apiClient.post<Position>(this.BASE_PATH, data)
    );
  }

  /**
   * Update existing position
   * PUT /admin/position/:id
   */
  static async update(id: string, data: UpdatePositionRequest): Promise<Position> {
    if (!id) {
      throw new Error('Position ID is required');
    }
    
    // Validate required fields
    this.validateUpdateRequest(data);
    
    return apiRequest(() => 
      apiClient.put<Position>(`${this.BASE_PATH}/${id}`, data)
    );
  }

  /**
   * Delete position (soft delete)
   * DELETE /admin/position/:id
   */
  static async delete(id: string): Promise<Position> {
    if (!id) {
      throw new Error('Position ID is required');
    }
    
    return apiRequest(() => 
      apiClient.delete<Position>(`${this.BASE_PATH}/${id}`)
    );
  }

  /**
   * Validate create position request
   */
  private static validateCreateRequest(data: CreatePositionRequest): void {
    // Name is required and must be 3-255 characters
    if (!data.name || data.name.trim() === '') {
      throw new Error('Position name is required');
    }
    
    if (data.name.length < 3 || data.name.length > 255) {
      throw new Error('Position name must be between 3 and 255 characters');
    }
    
    // Department ID is required
    if (!data.departmentId || data.departmentId.trim() === '') {
      throw new Error('Department ID is required');
    }
    
    // Validate ObjectId format (24 character hex string)
    if (!/^[0-9a-fA-F]{24}$/.test(data.departmentId)) {
      throw new Error('Department ID must be a valid ObjectId');
    }
    
    // Status validation (optional)
    if (data.status && !['ACTIVE', 'INACTIVE'].includes(data.status)) {
      throw new Error('Status must be either ACTIVE or INACTIVE');
    }
  }

  /**
   * Validate update position request
   */
  private static validateUpdateRequest(data: UpdatePositionRequest): void {
    // Name is required and must be 3-255 characters
    if (!data.name || data.name.trim() === '') {
      throw new Error('Position name is required');
    }
    
    if (data.name.length < 3 || data.name.length > 255) {
      throw new Error('Position name must be between 3 and 255 characters');
    }
    
    // Department ID is required
    if (!data.departmentId || data.departmentId.trim() === '') {
      throw new Error('Department ID is required');
    }
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(data.departmentId)) {
      throw new Error('Department ID must be a valid ObjectId');
    }
    
    // Status validation (optional)
    if (data.status && !['ACTIVE', 'INACTIVE'].includes(data.status)) {
      throw new Error('Status must be either ACTIVE or INACTIVE');
    }
  }

  /**
   * Get positions by department ID
   * Helper method for filtering
   */
  static async getByDepartment(departmentId: string): Promise<Position[]> {
    if (!departmentId) {
      throw new Error('Department ID is required');
    }
    
    const positions = await this.getAll();
    return positions.filter(position => 
      position.departmentId === departmentId && !position.isDeleted
    );
  }

  /**
   * Get active positions only
   * Helper method for filtering
   */
  static async getActive(): Promise<Position[]> {
    const positions = await this.getAll();
    return positions.filter(position => 
      position.status === 'ACTIVE' && !position.isDeleted
    );
  }

  /**
   * Search positions by name or description
   * Helper method for searching
   */
  static async search(query: string): Promise<Position[]> {
    const positions = await this.getAll();
    const searchTerm = query.toLowerCase();
    
    return positions.filter(position => 
      (position.name.toLowerCase().includes(searchTerm) ||
       (position.description && position.description.toLowerCase().includes(searchTerm))) &&
      !position.isDeleted
    );
  }

  /**
   * Check if position exists by name
   * Helper method for validation
   */
  static async existsByName(name: string, excludeId?: string): Promise<boolean> {
    try {
      const positions = await this.getAll();
      return positions.some(position => 
        position.name.toLowerCase() === name.toLowerCase() &&
        position.id !== excludeId &&
        !position.isDeleted
      );
    } catch {
      return false;
    }
  }

  /**
   * Get position statistics
   * Helper method for dashboard
   */
  static async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byDepartment: Record<string, number>;
  }> {
    const positions = await this.getAll();
    const activePositions = positions.filter(position => !position.isDeleted);
    
    // Count by department
    const byDepartment: Record<string, number> = {};
    activePositions.forEach(position => {
      byDepartment[position.departmentId] = (byDepartment[position.departmentId] || 0) + 1;
    });
    
    return {
      total: activePositions.length,
      active: activePositions.filter(position => position.status === 'ACTIVE').length,
      inactive: activePositions.filter(position => position.status === 'INACTIVE').length,
      byDepartment,
    };
  }

  /**
   * Bulk operations helper
   * Update multiple positions status
   */
  static async bulkUpdateStatus(
    positionIds: string[], 
    status: 'ACTIVE' | 'INACTIVE'
  ): Promise<Position[]> {
    const updatePromises = positionIds.map(async (id) => {
      const position = await this.getById(id);
      return this.update(id, {
        name: position.name,
        departmentId: position.department,
        description: position.description,
        status,
      });
    });
    
    return Promise.all(updatePromises);
  }
}

export default PositionService;
