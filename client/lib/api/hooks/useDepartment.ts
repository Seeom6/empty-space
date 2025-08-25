import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { DepartmentService } from '../services/departmentService';
import { ApiError } from '../client';
import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  QueryKeys,
  MutationKeys,
  ErrorCodes
} from '../types';

// Query Hooks

/**
 * Hook to fetch all departments
 */
export const useDepartments = (
  options?: Omit<UseQueryOptions<Department[], ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Department[], ApiError>({
    queryKey: QueryKeys.DEPARTMENT_ALL,
    queryFn: () => DepartmentService.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch department by ID
 */
export const useDepartment = (
  id: string,
  options?: Omit<UseQueryOptions<Department, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Department, ApiError>({
    queryKey: QueryKeys.DEPARTMENT_BY_ID(id),
    queryFn: () => DepartmentService.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch active departments only
 */
export const useActiveDepartments = (
  options?: Omit<UseQueryOptions<Department[], ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Department[], ApiError>({
    queryKey: [...QueryKeys.DEPARTMENT_ALL, 'active'],
    queryFn: () => DepartmentService.getActive(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to fetch department statistics
 */
export const useDepartmentStatistics = (
  options?: Omit<UseQueryOptions<{ total: number; active: number; inactive: number }, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<{ total: number; active: number; inactive: number }, ApiError>({
    queryKey: [...QueryKeys.DEPARTMENT_ALL, 'statistics'],
    queryFn: () => DepartmentService.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Mutation Hooks

/**
 * Hook to create a new department
 */
export const useCreateDepartment = (
  options?: UseMutationOptions<Department, ApiError, CreateDepartmentRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<Department, ApiError, CreateDepartmentRequest>({
    mutationKey: [MutationKeys.CREATE_DEPARTMENT],
    mutationFn: DepartmentService.create,
    onSuccess: (data) => {
      // Invalidate and refetch department queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.DEPARTMENT_ALL });
      
      // Add the new department to the cache
      queryClient.setQueryData(QueryKeys.DEPARTMENT_BY_ID(data.id), data);
      
      toast.success('Department created successfully');
    },
    onError: (error) => {
      if (error.code === ErrorCodes.DEPARTMENT_ALREADY_EXISTS) {
        toast.error('A department with this name already exists');
      } else if (error.isValidationError()) {
        toast.error(`Validation error: ${error.message}`);
      } else {
        toast.error('Failed to create department');
      }
    },
    ...options,
  });
};

/**
 * Hook to update a department
 */
export const useUpdateDepartment = (
  options?: UseMutationOptions<Department, ApiError, { id: string; data: UpdateDepartmentRequest }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Department, ApiError, { id: string; data: UpdateDepartmentRequest }>({
    mutationKey: [MutationKeys.UPDATE_DEPARTMENT],
    mutationFn: ({ id, data }) => DepartmentService.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific department in cache
      queryClient.setQueryData(QueryKeys.DEPARTMENT_BY_ID(variables.id), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.DEPARTMENT_ALL });
      
      toast.success('Department updated successfully');
    },
    onError: (error) => {
      if (error.code === ErrorCodes.DEPARTMENT_NOT_FOUND) {
        toast.error('Department not found');
      } else if (error.code === ErrorCodes.DEPARTMENT_ALREADY_EXISTS) {
        toast.error('A department with this name already exists');
      } else if (error.isValidationError()) {
        toast.error(`Validation error: ${error.message}`);
      } else {
        toast.error('Failed to update department');
      }
    },
    ...options,
  });
};

/**
 * Hook to delete a department
 */
export const useDeleteDepartment = (
  options?: UseMutationOptions<void, ApiError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationKey: [MutationKeys.DELETE_DEPARTMENT],
    mutationFn: DepartmentService.delete,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QueryKeys.DEPARTMENT_BY_ID(id) });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.DEPARTMENT_ALL });
      
      // Also invalidate position queries since they depend on departments
      queryClient.invalidateQueries({ queryKey: QueryKeys.POSITION_ALL });
      
      toast.success('Department deleted successfully');
    },
    onError: (error) => {
      if (error.code === ErrorCodes.DEPARTMENT_NOT_FOUND) {
        toast.error('Department not found');
      } else if (error.code === ErrorCodes.DEPARTMENT_HAS_POSITION) {
        toast.error('Cannot delete department that has positions');
      } else if (error.code === ErrorCodes.DEPARTMENT_HAS_EMPLOYEE) {
        toast.error('Cannot delete department that has employees');
      } else {
        toast.error('Failed to delete department');
      }
    },
    ...options,
  });
};

// Utility Hooks

/**
 * Hook to search departments
 */
export const useSearchDepartments = (query: string) => {
  return useQuery<Department[], ApiError>({
    queryKey: [...QueryKeys.DEPARTMENT_ALL, 'search', query],
    queryFn: () => DepartmentService.search(query),
    enabled: !!query && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to check if department name exists
 */
export const useDepartmentNameExists = (name: string, excludeId?: string) => {
  return useQuery<boolean, ApiError>({
    queryKey: [...QueryKeys.DEPARTMENT_ALL, 'exists', name, excludeId],
    queryFn: () => DepartmentService.existsByName(name, excludeId),
    enabled: !!name && name.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook for bulk status update
 */
export const useBulkUpdateDepartmentStatus = (
  options?: UseMutationOptions<Department[], ApiError, { ids: string[]; status: 'ACTIVE' | 'INACTIVE' }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Department[], ApiError, { ids: string[]; status: 'ACTIVE' | 'INACTIVE' }>({
    mutationKey: [MutationKeys.UPDATE_DEPARTMENT, 'bulk'],
    mutationFn: ({ ids, status }) => DepartmentService.bulkUpdateStatus(ids, status),
    onSuccess: (data) => {
      // Invalidate all department queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.DEPARTMENT_ALL });
      
      // Update individual department caches
      data.forEach(department => {
        queryClient.setQueryData(QueryKeys.DEPARTMENT_BY_ID(department.id), department);
      });
      
      toast.success(`${data.length} departments updated successfully`);
    },
    onError: (error) => {
      toast.error('Failed to update departments');
    },
    ...options,
  });
};
