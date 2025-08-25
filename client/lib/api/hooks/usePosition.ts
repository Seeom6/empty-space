import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { PositionService } from '../services/positionService';
import { ApiError } from '../client';
import {
  Position,
  PositionWithDepartment,
  CreatePositionRequest,
  UpdatePositionRequest,
  QueryKeys,
  MutationKeys,
  ErrorCodes
} from '../types';

// Query Hooks

/**
 * Hook to fetch all positions
 */
export const usePositions = (
  options?: Omit<UseQueryOptions<Position[], ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Position[], ApiError>({
    queryKey: QueryKeys.POSITION_ALL,
    queryFn: () => PositionService.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch position by ID (includes department name)
 */
export const usePosition = (
  id: string,
  options?: Omit<UseQueryOptions<PositionWithDepartment, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PositionWithDepartment, ApiError>({
    queryKey: QueryKeys.POSITION_BY_ID(id),
    queryFn: () => PositionService.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch active positions only
 */
export const useActivePositions = (
  options?: Omit<UseQueryOptions<Position[], ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Position[], ApiError>({
    queryKey: [...QueryKeys.POSITION_ALL, 'active'],
    queryFn: () => PositionService.getActive(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to fetch positions by department
 */
export const usePositionsByDepartment = (
  departmentId: string,
  options?: Omit<UseQueryOptions<Position[], ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Position[], ApiError>({
    queryKey: [...QueryKeys.POSITION_ALL, 'department', departmentId],
    queryFn: () => PositionService.getByDepartment(departmentId),
    enabled: !!departmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch position statistics
 */
export const usePositionStatistics = (
  options?: Omit<UseQueryOptions<{
    total: number;
    active: number;
    inactive: number;
    byDepartment: Record<string, number>;
  }, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<{
    total: number;
    active: number;
    inactive: number;
    byDepartment: Record<string, number>;
  }, ApiError>({
    queryKey: [...QueryKeys.POSITION_ALL, 'statistics'],
    queryFn: () => PositionService.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Mutation Hooks

/**
 * Hook to create a new position
 */
export const useCreatePosition = (
  options?: UseMutationOptions<Position, ApiError, CreatePositionRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<Position, ApiError, CreatePositionRequest>({
    mutationKey: [MutationKeys.CREATE_POSITION],
    mutationFn: PositionService.create,
    onSuccess: (data) => {
      // Invalidate and refetch position queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.POSITION_ALL });
      
      // Add the new position to the cache
      queryClient.setQueryData(QueryKeys.POSITION_BY_ID(data.id), data);
      
      toast.success('Position created successfully');
    },
    onError: (error) => {
      if (error.code === ErrorCodes.POSITION_ALREADY_EXISTS) {
        toast.error('A position with this name already exists');
      } else if (error.code === ErrorCodes.DEPARTMENT_NOT_FOUND) {
        toast.error('Selected department not found');
      } else if (error.isValidationError()) {
        toast.error(`Validation error: ${error.message}`);
      } else {
        toast.error('Failed to create position');
      }
    },
    ...options,
  });
};

/**
 * Hook to update a position
 */
export const useUpdatePosition = (
  options?: UseMutationOptions<Position, ApiError, { id: string; data: UpdatePositionRequest }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Position, ApiError, { id: string; data: UpdatePositionRequest }>({
    mutationKey: [MutationKeys.UPDATE_POSITION],
    mutationFn: ({ id, data }) => PositionService.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific position in cache
      queryClient.setQueryData(QueryKeys.POSITION_BY_ID(variables.id), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.POSITION_ALL });
      
      toast.success('Position updated successfully');
    },
    onError: (error) => {
      if (error.code === ErrorCodes.POSITION_NOT_FOUND) {
        toast.error('Position not found');
      } else if (error.code === ErrorCodes.POSITION_ALREADY_EXISTS) {
        toast.error('A position with this name already exists');
      } else if (error.code === ErrorCodes.DEPARTMENT_NOT_FOUND) {
        toast.error('Selected department not found');
      } else if (error.isValidationError()) {
        toast.error(`Validation error: ${error.message}`);
      } else {
        toast.error('Failed to update position');
      }
    },
    ...options,
  });
};

/**
 * Hook to delete a position (soft delete)
 */
export const useDeletePosition = (
  options?: UseMutationOptions<Position, ApiError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation<Position, ApiError, string>({
    mutationKey: [MutationKeys.DELETE_POSITION],
    mutationFn: PositionService.delete,
    onSuccess: (data, id) => {
      // Remove from cache or mark as deleted
      queryClient.removeQueries({ queryKey: QueryKeys.POSITION_BY_ID(id) });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.POSITION_ALL });
      
      toast.success('Position deleted successfully');
    },
    onError: (error) => {
      if (error.code === ErrorCodes.POSITION_NOT_FOUND) {
        toast.error('Position not found');
      } else {
        toast.error('Failed to delete position');
      }
    },
    ...options,
  });
};

// Utility Hooks

/**
 * Hook to search positions
 */
export const useSearchPositions = (query: string) => {
  return useQuery<Position[], ApiError>({
    queryKey: [...QueryKeys.POSITION_ALL, 'search', query],
    queryFn: () => PositionService.search(query),
    enabled: !!query && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to check if position name exists
 */
export const usePositionNameExists = (name: string, excludeId?: string) => {
  return useQuery<boolean, ApiError>({
    queryKey: [...QueryKeys.POSITION_ALL, 'exists', name, excludeId],
    queryFn: () => PositionService.existsByName(name, excludeId),
    enabled: !!name && name.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook for bulk status update
 */
export const useBulkUpdatePositionStatus = (
  options?: UseMutationOptions<Position[], ApiError, { ids: string[]; status: 'ACTIVE' | 'INACTIVE' }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Position[], ApiError, { ids: string[]; status: 'ACTIVE' | 'INACTIVE' }>({
    mutationKey: [MutationKeys.UPDATE_POSITION, 'bulk'],
    mutationFn: ({ ids, status }) => PositionService.bulkUpdateStatus(ids, status),
    onSuccess: (data) => {
      // Invalidate all position queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.POSITION_ALL });
      
      // Update individual position caches
      data.forEach(position => {
        queryClient.setQueryData(QueryKeys.POSITION_BY_ID(position.id), position);
      });
      
      toast.success(`${data.length} positions updated successfully`);
    },
    onError: (error) => {
      toast.error('Failed to update positions');
    },
    ...options,
  });
};
