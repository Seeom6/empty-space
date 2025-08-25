import { apiClient, apiRequest } from '../client';
import {
  Technology,
  TechnologyStatistics,
  CreateTechnologyRequest,
  UpdateTechnologyRequest,
} from '../types';

/**
 * Technology API Service
 * Handles all CRUD operations for the Technology system
 * Requires SUPER_ADMIN role for all operations
 */
export class TechnologyService {
  private static readonly BASE_PATH = '/admin/technology';

  /**
   * Get technology statistics
   * GET /admin/technology
   */
  static async getStatistics(): Promise<TechnologyStatistics> {
    return apiRequest(() => 
      apiClient.get<TechnologyStatistics>(this.BASE_PATH)
    );
  }

  /**
   * Get all technologies
   * GET /admin/technology/all
   */
  static async getAll(): Promise<Technology[]> {
    const response = await apiRequest(() =>
      apiClient.get<{data: Technology[]} | Technology[]>(`${this.BASE_PATH}/all`)
    );

    // Handle both response formats: {data: Technology[]} or Technology[]
    if (response && typeof response === 'object' && 'data' in response) {
      console.log('📦 API returned wrapped response, extracting data array');
      return (response as {data: Technology[]}).data;
    }

    console.log('📦 API returned direct array response');
    return response as Technology[];
  }

  /**
   * Get technology by ID
   * GET /admin/technology/:id
   */
  static async getById(id: string): Promise<Technology> {
    if (!id) {
      throw new Error('Technology ID is required');
    }
    
    return apiRequest(() => 
      apiClient.get<Technology>(`${this.BASE_PATH}/${id}`)
    );
  }

  /**
   * Create new technology
   * POST /admin/technology
   */
  static async create(data: CreateTechnologyRequest): Promise<Technology> {
    // Validate required fields
    this.validateCreateRequest(data);
    
    return apiRequest(() => 
      apiClient.post<Technology>(this.BASE_PATH, data)
    );
  }

  /**
   * Update existing technology
   * PUT /admin/technology/:id
   */
  static async update(id: string, data: UpdateTechnologyRequest): Promise<Technology> {
    if (!id) {
      throw new Error('Technology ID is required');
    }
    
    // Validate required fields
    this.validateUpdateRequest(data);
    
    return apiRequest(() => 
      apiClient.put<Technology>(`${this.BASE_PATH}/${id}`, data)
    );
  }

  /**
   * Delete technology (soft delete)
   * DELETE /admin/technology/:id
   */
  static async delete(id: string): Promise<Technology> {
    if (!id) {
      throw new Error('Technology ID is required');
    }
    
    return apiRequest(() => 
      apiClient.delete<Technology>(`${this.BASE_PATH}/${id}`)
    );
  }

  /**
   * Validate create technology request
   */
  private static validateCreateRequest(data: CreateTechnologyRequest): void {
    const requiredFields: (keyof CreateTechnologyRequest)[] = [
      'name', 'description', 'icon', 'website', 'version', 'category'
    ];
    
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        throw new Error(`${field} is required`);
      }
    }
    
    // Validate URL format for website
    if (!this.isValidUrl(data.website)) {
      throw new Error('Website must be a valid URL');
    }
  }

  /**
   * Validate update technology request
   */
  private static validateUpdateRequest(data: UpdateTechnologyRequest): void {
    const requiredFields: (keyof UpdateTechnologyRequest)[] = [
      'name', 'description', 'icon', 'website', 'version', 'category', 'status'
    ];
    
    for (const field of requiredFields) {
      if (!data[field] || data[field].toString().trim() === '') {
        throw new Error(`${field} is required`);
      }
    }
    
    // Validate URL format for website
    if (!this.isValidUrl(data.website)) {
      throw new Error('Website must be a valid URL');
    }
    
    // Validate status
    if (!['ACTIVE', 'INACTIVE'].includes(data.status)) {
      throw new Error('Status must be either ACTIVE or INACTIVE');
    }
  }

  /**
   * Validate URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get technologies by category
   * Helper method for filtering
   */
  static async getByCategory(category: string): Promise<Technology[]> {
    const technologies = await this.getAll();
    return technologies.filter(tech => 
      tech.category.toLowerCase() === category.toLowerCase() && !tech.isDeleted
    );
  }

  /**
   * Get active technologies only
   * Helper method for filtering
   */
  static async getActive(): Promise<Technology[]> {
    const technologies = await this.getAll();
    return technologies.filter(tech => 
      tech.status === 'ACTIVE' && !tech.isDeleted
    );
  }

  /**
   * Search technologies by name or description
   * Helper method for searching
   */
  static async search(query: string): Promise<Technology[]> {
    const technologies = await this.getAll();
    const searchTerm = query.toLowerCase();
    
    return technologies.filter(tech => 
      (tech.name.toLowerCase().includes(searchTerm) ||
       tech.description.toLowerCase().includes(searchTerm) ||
       tech.category.toLowerCase().includes(searchTerm)) &&
      !tech.isDeleted
    );
  }
}

export default TechnologyService;
