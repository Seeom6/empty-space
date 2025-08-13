import React, { memo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X, Filter } from 'lucide-react'
import { RoleFilters as RoleFiltersType } from '../types'

interface RoleFiltersProps {
  filters: RoleFiltersType
  onFiltersChange: (filters: Partial<RoleFiltersType>) => void
  onClearFilters: () => void
  className?: string
}

export const RoleFilters = memo<RoleFiltersProps>(({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}) => {
  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.category !== 'all'

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({ status })
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
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

      {/* Status Filter */}
      <Select value={filters.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
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

RoleFilters.displayName = 'RoleFilters'
