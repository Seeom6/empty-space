"use client"
import React, { useState } from "react"
import { Filter, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Status } from "@/lib/api/types"

interface DepartmentFiltersState {
  status: Status | "ALL"
  nameContains: string
  descriptionContains: string
  sortBy: "name" | "status" | "created"
  sortOrder: "asc" | "desc"
}

interface DepartmentFiltersProps {
  onFiltersChange: (filters: DepartmentFiltersState) => void
  initialFilters?: Partial<DepartmentFiltersState>
}

export const DepartmentFilters: React.FC<DepartmentFiltersProps> = ({
  onFiltersChange,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<DepartmentFiltersState>({
    status: "ALL",
    nameContains: "",
    descriptionContains: "",
    sortBy: "name",
    sortOrder: "asc",
    ...initialFilters
  })

  const updateFilter = <K extends keyof DepartmentFiltersState>(
    key: K,
    value: DepartmentFiltersState[K]
  ) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters: DepartmentFiltersState = {
      status: "ALL",
      nameContains: "",
      descriptionContains: "",
      sortBy: "name",
      sortOrder: "asc"
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.status !== "ALL") count++
    if (filters.nameContains) count++
    if (filters.descriptionContains) count++
    if (filters.sortBy !== "name" || filters.sortOrder !== "asc") count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount} active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Refine your department search with advanced filtering options
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="gap-2"
            disabled={activeFiltersCount === 0}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilter("status", value as Status | "ALL")}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sort-by">Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter("sortBy", value as "name" | "status" | "created")}
            >
              <SelectTrigger id="sort-by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sort-order">Sort Order</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => updateFilter("sortOrder", value as "asc" | "desc")}
            >
              <SelectTrigger id="sort-order">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Contains */}
          <div className="space-y-2">
            <Label htmlFor="name-contains">Name Contains</Label>
            <Input
              id="name-contains"
              placeholder="Search in department names..."
              value={filters.nameContains}
              onChange={(e) => updateFilter("nameContains", e.target.value)}
            />
          </div>

          {/* Description Contains */}
          <div className="space-y-2">
            <Label htmlFor="description-contains">Description Contains</Label>
            <Input
              id="description-contains"
              placeholder="Search in descriptions..."
              value={filters.descriptionContains}
              onChange={(e) => updateFilter("descriptionContains", e.target.value)}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Active filters:</span>
              
              {filters.status !== "ALL" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filters.status}
                  <button
                    onClick={() => updateFilter("status", "ALL")}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.nameContains && (
                <Badge variant="secondary" className="gap-1">
                  Name: "{filters.nameContains}"
                  <button
                    onClick={() => updateFilter("nameContains", "")}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.descriptionContains && (
                <Badge variant="secondary" className="gap-1">
                  Description: "{filters.descriptionContains}"
                  <button
                    onClick={() => updateFilter("descriptionContains", "")}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(filters.sortBy !== "name" || filters.sortOrder !== "asc") && (
                <Badge variant="secondary" className="gap-1">
                  Sort: {filters.sortBy} ({filters.sortOrder})
                  <button
                    onClick={() => {
                      updateFilter("sortBy", "name")
                      updateFilter("sortOrder", "asc")
                    }}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
