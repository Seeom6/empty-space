import React, { memo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, X, Filter } from 'lucide-react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { AnalyticsFilters } from '../types'
import { DEPARTMENTS, TIME_RANGES } from '../constants'
import { formatDateRange } from '../utils'

interface FilterPanelProps {
  filters: AnalyticsFilters
  onFiltersChange: (filters: Partial<AnalyticsFilters>) => void
  onClearFilters: () => void
  className?: string
}

export const FilterPanel = memo<FilterPanelProps>(({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}) => {
  const hasActiveFilters = filters.search || 
    filters.department !== 'All Departments' || 
    filters.module !== 'all' ||
    filters.status !== 'all' ||
    filters.dateRange.from ||
    filters.dateRange.to

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value })
  }

  const handleDepartmentChange = (department: string) => {
    onFiltersChange({ department })
  }

  const handleModuleChange = (module: string) => {
    onFiltersChange({ module })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({ status })
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({
      dateRange: range ? { from: range.from, to: range.to } : { from: undefined, to: undefined }
    })
  }

  return (
    <div className={`flex flex-col lg:flex-row items-start lg:items-center gap-4 p-4 bg-muted/50 rounded-lg ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 w-full lg:w-auto min-w-80">
        <Input
          placeholder="Search analytics data..."
          value={filters.search}
          onChange={handleSearchChange}
          className="pr-10"
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

      {/* Department Filter */}
      <Select value={filters.department} onValueChange={handleDepartmentChange}>
        <SelectTrigger className="w-full lg:w-48">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          {DEPARTMENTS.map((dept: string) => (
            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Module Filter */}
      <Select value={filters.module} onValueChange={handleModuleChange}>
        <SelectTrigger className="w-full lg:w-32">
          <SelectValue placeholder="Module" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Modules</SelectItem>
          <SelectItem value="projects">Projects</SelectItem>
          <SelectItem value="employees">Employees</SelectItem>
          <SelectItem value="payroll">Payroll</SelectItem>
          <SelectItem value="performance">Performance</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={filters.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full lg:w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full lg:w-64 justify-start text-left"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(filters.dateRange.from, filters.dateRange.to)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: filters.dateRange.from,
              to: filters.dateRange.to
            }}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="gap-2 w-full lg:w-auto"
        >
          <Filter className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
})

FilterPanel.displayName = 'FilterPanel'
