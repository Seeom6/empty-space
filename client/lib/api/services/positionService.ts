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
    const response = await apiRequest(() =>
      apiClient.get<any>(PositionService.BASE_PATH)
    );

    // Handle both direct array and wrapped response
    if (Array.isArray(response)) {
      return response;
    } else if (response && Array.isArray(response.data)) {
      return response.data;
    } else {
      return [];
    }
  }

  /**
   * Get position by ID (includes department name)
   * GET /admin/position/:id
   */
  static async getById(id: string): Promise<PositionWithDepartment> {
    if (!id) {
      throw new Error('Position ID is required');
    }

    const response = await apiRequest(() =>
      apiClient.get<any>(`${PositionService.BASE_PATH}/${id}`)
    );

    // Handle wrapped response format
    if (response && response.data) {
      return response.data;
    } else if (response && response.id) {
      return response;
    } else {
      throw new Error('Invalid response format from server');
    }
  }

  /**
   * Create new position
   * POST /admin/position
   */
  static async create(data: CreatePositionRequest): Promise<Position> {
    // Validate required fields
    PositionService.validateCreateRequest(data);

    const response = await apiRequest(() =>
      apiClient.post<any>(PositionService.BASE_PATH, data)
    );

    // Handle backend inconsistency: create returns {} instead of {data: Position}
    // Return a mock position object for UI consistency
    return {
      id: 'temp-' + Date.now(), // Temporary ID until refresh
      name: data.name,
      departmentId: data.departmentId,
      description: data.description || '',
      status: data.status || 'ACTIVE',
      isDeleted: false
    };
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
    PositionService.validateUpdateRequest(data);

    const response = await apiRequest(() =>
      apiClient.put<any>(`${PositionService.BASE_PATH}/${id}`, data)
    );

    // Handle wrapped response format
    if (response && response.data) {
      return response.data;
    } else if (response && response.id) {
      return response;
    } else {
      throw new Error('Invalid response format from server');
    }
  }

  /**
   * Delete position (soft delete)
   * DELETE /admin/position/:id
   */
  static async delete(id: string): Promise<Position> {
    if (!id) {
      throw new Error('Position ID is required');
    }

    const response = await apiRequest(() =>
      apiClient.delete<any>(`${PositionService.BASE_PATH}/${id}`)
    );

    // Handle wrapped response format
    if (response && response.data) {
      return response.data;
    } else if (response && response.id) {
      return response;
    } else {
      throw new Error('Invalid response format from server');
    }
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

    const positions = await PositionService.getAll();
    return positions.filter(position =>
      position.departmentId === departmentId && !position.isDeleted
    );
  }

  /**
   * Get active positions only
   * Helper method for filtering
   */
  static async getActive(): Promise<Position[]> {
    const positions = await PositionService.getAll();
    return positions.filter(position =>
      position.status === 'ACTIVE' && !position.isDeleted
    );
  }

  /**
   * Search positions by name or description
   * Helper method for searching
   */
  static async search(query: string): Promise<Position[]> {
    const positions = await PositionService.getAll();
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
      const positions = await PositionService.getAll();
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
   * Helper method for dashboard stats
   */
  static async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byDepartment: Record<string, number>;
  }> {
    try {
      const positions = await PositionService.getAll();

      // Ensure positions is an array
      if (!Array.isArray(positions)) {
        return {
          total: 0,
          active: 0,
          inactive: 0,
          byDepartment: {}
        };
      }

      const activePositions = positions.filter(position => !position.isDeleted);

      // Count by department
      const byDepartment: Record<string, number> = {};
      activePositions.forEach(position => {
        byDepartment[position.departmentId] = (byDepartment[position.departmentId] || 0) + 1;
      });

      const stats = {
        total: activePositions.length,
        active: activePositions.filter(position => position.status === 'ACTIVE').length,
        inactive: activePositions.filter(position => position.status === 'INACTIVE').length,
        byDepartment,
      };

      return stats;
    } catch (error) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byDepartment: {}
      };
    }
  }

  // Bulk operations removed for simplicity
}

export default PositionService;
