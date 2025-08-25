import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProjectFiltersProps {
  filters: {
    search: string
    status: string
    priority: string
    manager: string
    tags: string[]
  }
  onFiltersChange: (filters: any) => void
  users: Array<{ id: string; name: string; avatar: string }>
}

export function ProjectFilters({ filters, onFiltersChange, users }: ProjectFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      priority: 'all',
      manager: 'all',
      tags: []
    })
  }

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    return value !== '' && value !== 'all'
  }).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects by name..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="inprogress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="onhold">On Hold</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        {/* Manager Filter */}
        <Select value={filters.manager} onValueChange={(value) => updateFilter('manager', value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Managers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Managers</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            Clear Filters
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  )
}