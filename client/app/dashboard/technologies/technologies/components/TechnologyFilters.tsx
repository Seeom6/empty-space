import React, { memo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X, Filter } from 'lucide-react'
import { TechnologyFilters as TechnologyFiltersType } from '../types'
import { TECHNOLOGY_CATEGORIES, TECHNOLOGY_STATUSES } from '../constants'

interface TechnologyFiltersProps {
  filters: TechnologyFiltersType
  onFiltersChange: (filters: Partial<TechnologyFiltersType>) => void
  onClearFilters: () => void
  className?: string
}

export const TechnologyFilters = memo<TechnologyFiltersProps>(({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}) => {
  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.status !== 'all'

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value })
  }, [onFiltersChange])

  const handleCategoryChange = useCallback((category: string) => {
    onFiltersChange({ category })
  }, [onFiltersChange])

  const handleStatusChange = useCallback((status: string) => {
    onFiltersChange({ status })
  }, [onFiltersChange])

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search technologies..."
          value={filters.search}
          onChange={handleSearchChange}
          className="pl-10 pr-10"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ search: '' })}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <Select value={filters.category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {TECHNOLOGY_CATEGORIES.map(category => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={filters.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {TECHNOLOGY_STATUSES.map(status => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
})

TechnologyFilters.displayName = 'TechnologyFilters'
