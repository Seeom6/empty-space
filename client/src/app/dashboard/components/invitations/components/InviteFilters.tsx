import React, { memo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X, Filter } from 'lucide-react'
import { InviteFilters as InviteFiltersType } from '../types'
import { DEPARTMENTS, ROLES } from '../constants'

interface InviteFiltersProps {
  filters: InviteFiltersType
  onFiltersChange: (filters: Partial<InviteFiltersType>) => void
  onClearFilters: () => void
  className?: string
}

export const InviteFilters = memo<InviteFiltersProps>(({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}) => {
  const hasActiveFilters = filters.search || 
    filters.status !== 'all' || 
    filters.department !== 'all' || 
    filters.role !== 'all'

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({ status })
  }

  const handleDepartmentChange = (department: string) => {
    onFiltersChange({ department })
  }

  const handleRoleChange = (role: string) => {
    onFiltersChange({ role })
  }

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invites..."
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
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="used">Used</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
          <SelectItem value="revoked">Revoked</SelectItem>
        </SelectContent>
      </Select>

      {/* Department Filter */}
      <Select value={filters.department} onValueChange={handleDepartmentChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {DEPARTMENTS.map(dept => (
            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Role Filter */}
      <Select value={filters.role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {ROLES.map(role => (
            <SelectItem key={role} value={role}>{role}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="gap-2 w-full sm:w-auto"
        >
          <Filter className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
})

InviteFilters.displayName = 'InviteFilters'
