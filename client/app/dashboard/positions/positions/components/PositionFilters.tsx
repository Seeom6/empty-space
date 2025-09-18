import React, { memo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { PositionFilters as PositionFiltersType, Department } from '../types'
import { POSITION_STATUSES, POSITION_STATUS_LABELS } from '../constants'

interface PositionFiltersProps {
  filters: PositionFiltersType
  departments: Department[]
  onFiltersChange: (filters: Partial<PositionFiltersType>) => void
  onClearFilters: () => void
}

export const PositionFilters = memo<PositionFiltersProps>(({
  filters,
  departments,
  onFiltersChange,
  onClearFilters
}) => {
  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.department !== 'all'

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value })
  }, [onFiltersChange])

  const handleStatusChange = useCallback((status: string) => {
    onFiltersChange({ status: status as PositionFiltersType['status'] })
  }, [onFiltersChange])

  const handleDepartmentChange = useCallback((department: string) => {
    onFiltersChange({ department })
  }, [onFiltersChange])

  return (
    <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 shadow-lg mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search positions by name or description..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-10 bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100 focus:border-purple-500 focus:ring-purple-500">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all" className="text-slate-100 focus:bg-slate-700">All Statuses</SelectItem>
              {POSITION_STATUSES.map(status => (
                <SelectItem key={status} value={status} className="text-slate-100 focus:bg-slate-700">
                  {POSITION_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department Filter */}
        <div className="w-full lg:w-48">
          <Select value={filters.department} onValueChange={handleDepartmentChange}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100 focus:border-purple-500 focus:ring-purple-500">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all" className="text-slate-100 focus:bg-slate-700">All Departments</SelectItem>
              {Array.isArray(departments) && departments
                .filter(dept => !dept.isDeleted && dept.status === 'ACTIVE')
                .map(department => (
                  <SelectItem key={department.id} value={department.name} className="text-slate-100 focus:bg-slate-700">
                    {department.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2 whitespace-nowrap bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700 hover:border-slate-500"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.search && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs rounded-md">
              <span>Search: "{filters.search}"</span>
              <button
                onClick={() => onFiltersChange({ search: '' })}
                className="hover:bg-purple-500/30 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {filters.status !== 'all' && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded-md">
              <span>Status: {POSITION_STATUS_LABELS[filters.status as keyof typeof POSITION_STATUS_LABELS]}</span>
              <button
                onClick={() => onFiltersChange({ status: 'all' })}
                className="hover:bg-slate-600 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {filters.department !== 'all' && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded-md">
              <span>Department: {filters.department}</span>
              <button
                onClick={() => onFiltersChange({ department: 'all' })}
                className="hover:bg-slate-600 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

PositionFilters.displayName = 'PositionFilters'
