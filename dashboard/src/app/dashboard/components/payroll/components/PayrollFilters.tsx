import React, { memo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X, Filter } from 'lucide-react'
import { PayrollFilters as PayrollFiltersType } from '../types'
import { DEPARTMENTS, MONTHS, YEARS, SALARY_RANGE_OPTIONS } from '../constants'

interface PayrollFiltersProps {
  filters: PayrollFiltersType
  onFiltersChange: (filters: Partial<PayrollFiltersType>) => void
  onClearFilters: () => void
  className?: string
}

export const PayrollFilters = memo<PayrollFiltersProps>(({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}) => {
  const hasActiveFilters = filters.search || 
    filters.month !== 'all' || 
    filters.year !== 'all' ||
    filters.department !== 'all' || 
    filters.status !== 'all'

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value })
  }

  const handleMonthChange = (month: string) => {
    onFiltersChange({ month })
  }

  const handleYearChange = (year: string) => {
    onFiltersChange({ year })
  }

  const handleDepartmentChange = (department: string) => {
    onFiltersChange({ department })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({ status })
  }

  const handleSalaryRangeChange = (rangeValue: string) => {
    const range = SALARY_RANGE_OPTIONS.find(r => r.value === rangeValue)
    if (range) {
      onFiltersChange({ 
        salaryRange: { min: range.min, max: range.max } 
      })
    }
  }

  return (
    <div className={`flex flex-col lg:flex-row items-start lg:items-center gap-4 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 w-full lg:w-auto min-w-[300px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees, departments, or notes..."
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

      {/* Month Filter */}
      <Select value={filters.month} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-full lg:w-32">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Months</SelectItem>
          {MONTHS.map(month => (
            <SelectItem key={month} value={month}>{month}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year Filter */}
      <Select value={filters.year} onValueChange={handleYearChange}>
        <SelectTrigger className="w-full lg:w-24">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {YEARS.map(year => (
            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Department Filter */}
      <Select value={filters.department} onValueChange={handleDepartmentChange}>
        <SelectTrigger className="w-full lg:w-40">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {DEPARTMENTS.map(dept => (
            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={filters.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full lg:w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Paid">Paid</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Processing">Processing</SelectItem>
          <SelectItem value="Failed">Failed</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
          <SelectItem value="On Hold">On Hold</SelectItem>
        </SelectContent>
      </Select>

      {/* Salary Range Filter */}
      <Select 
        value={SALARY_RANGE_OPTIONS.find(r => 
          r.min === filters.salaryRange.min && r.max === filters.salaryRange.max
        )?.value || 'all'} 
        onValueChange={handleSalaryRangeChange}
      >
        <SelectTrigger className="w-full lg:w-40">
          <SelectValue placeholder="Salary Range" />
        </SelectTrigger>
        <SelectContent>
          {SALARY_RANGE_OPTIONS.map(range => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
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
          className="gap-2 w-full lg:w-auto"
        >
          <Filter className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
})

PayrollFilters.displayName = 'PayrollFilters'
