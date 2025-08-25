import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { TechnologyService } from '../services/technologyService';
import { ApiError } from '../client';
import {
  Technology,
  TechnologyStatistics,
  CreateTechnologyRequest,
  UpdateTechnologyRequest,
  QueryKeys,
  MutationKeys,
  ErrorCodes
} from '../types';

// Query Hooks

/**
 * Hook to fetch technology statistics
 */
export const useTechnologyStatistics = (
  options?: Omit<UseQueryOptions<TechnologyStatistics, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TechnologyStatistics, ApiError>({
    queryKey: QueryKeys.TECHNOLOGY_STATISTICS,
    queryFn: () => TechnologyService.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to fetch all technologies
 */
export const useTechnologies = (
  options?: Omit<UseQueryOptions<Technology[], ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Technology[], ApiError>({
    queryKey: QueryKeys.TECHNOLOGY_ALL,
    queryFn: () => TechnologyService.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch technology by ID
 */
export const useTechnology = (
  id: string,
  options?: Omit<UseQueryOptions<Technology, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Technology, ApiError>({
    queryKey: QueryKeys.TECHNOLOGY_BY_ID(id),
    queryFn: () => TechnologyService.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch active technologies only
 */
export const useActiveTechnologies = (
  options?: Omit<UseQueryOptions<Technology[], ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Technology[], ApiError>({
    queryKey: [...QueryKeys.TECHNOLOGY_ALL, 'active'],
    queryFn: () => TechnologyService.getActive(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Mutation Hooks

/**
 * Hook to create a new technology
 */
export const useCreateTechnology = (
  options?: UseMutationOptions<Technology, ApiError, CreateTechnologyRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<Technology, ApiError, CreateTechnologyRequest>({
    mutationKey: [MutationKeys.CREATE_TECHNOLOGY],
    mutationFn: (data) => TechnologyService.create(data),
    onSuccess: (data) => {
      // Invalidate and refetch technology queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.TECHNOLOGY_ALL });
      queryClient.invalidateQueries({ queryKey: QueryKeys.TECHNOLOGY_STATISTICS });
      
      // Add the new technology to the cache
      queryClient.setQueryData(QueryKeys.TECHNOLOGY_BY_ID(data.id), data);
      
      toast.success('Technology created successfully');
    },
    onError: (error) => {
      if (error.code === ErrorCodes.TECHNOLOGY_ALREADY_EXISTS) {
        toast.error('A technology with this name already exists');
      } else if (error.isValidationError()) {
        toast.error(`Validation error: ${error.message}`);
      } else {
        toast.error('Failed to create technology');
      }
    },
    ...options,
  });
};

/**
 * Hook to update a technology
 */
export const useUpdateTechnology = (
  options?: UseMutationOptions<Technology, ApiError, { id: string; data: UpdateTechnologyRequest }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Technology, ApiError, { id: string; data: UpdateTechnologyRequest }>({
    mutationKey: [MutationKeys.UPDATE_TECHNOLOGY],
    mutationFn: ({ id, data }) => TechnologyService.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific technology in cache
      queryClient.setQueryData(QueryKeys.TECHNOLOGY_BY_ID(variables.id), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.TECHNOLOGY_ALL });
      queryClient.invalidateQueries({ queryKey: QueryKeys.TECHNOLOGY_STATISTICS });
      
      toast.success('Technology updated successfully');
    },
    onError: (error) => {
      if (error.code === ErrorCodes.TECHNOLOGY_NOT_FOUND) {
        toast.error('Technology not found');
      } else if (error.code === ErrorCodes.TECHNOLOGY_ALREADY_EXISTS) {
        toast.error('A technology with this name already exists');
      } else if (error.isValidationError()) {
        toast.error(`Validation error: ${error.message}`);
      } else {
        toast.error('Failed to update technology');
      }
    },
    ...options,
  });
};

/**
 * Hook to delete a technology
 */
export const useDeleteTechnology = (
  options?: UseMutationOptions<Technology, ApiError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation<Technology, ApiError, string>({
    mutationKey: [MutationKeys.DELETE_TECHNOLOGY],
    mutationFn: (id) => TechnologyService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache or mark as deleted
      queryClient.removeQueries({ queryKey: QueryKeys.TECHNOLOGY_BY_ID(id) });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.TECHNOLOGY_ALL });
      queryClient.invalidateQueries({ queryKey: QueryKeys.TECHNOLOGY_STATISTICS });
      
      toast.success('Technology deleted successfully');
    },
    onError: (error) => {
      if (error.code === ErrorCodes.TECHNOLOGY_NOT_FOUND) {
        toast.error('Technology not found');
      } else {
        toast.error('Failed to delete technology');
      }
    },
    ...options,
  });
};

// Utility Hooks

/**
 * Hook to search technologies
 */
export const useSearchTechnologies = (query: string) => {
  return useQuery<Technology[], ApiError>({
    queryKey: [...QueryKeys.TECHNOLOGY_ALL, 'search', query],
    queryFn: () => TechnologyService.search(query),
    enabled: !!query && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get technologies by category
 */
export const useTechnologiesByCategory = (category: string) => {
  return useQuery<Technology[], ApiError>({
    queryKey: [...QueryKeys.TECHNOLOGY_ALL, 'category', category],
    queryFn: () => TechnologyService.getByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
