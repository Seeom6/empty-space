import React, { memo } from 'react'
import { PositionCard } from './components/PositionCard'
import { EmptyState } from './components/EmptyState'
import { Position, Department, PositionDisplayProps, PositionFilters } from './types'
import { getPositionPermissions } from './utils'

interface PositionsGridProps extends PositionDisplayProps {
  departments: Department[]
  isLoading?: boolean
  filters: PositionFilters
  onCreatePosition: () => void
  onClearFilters: () => void
}

export const PositionsGrid = memo<PositionsGridProps>(({
  positions,
  departments,
  userRole,
  isLoading,
  filters,
  onPositionClick,
  onEdit,
  onDelete,
  onView,
  onCreatePosition,
  onClearFilters,
  ...props
}) => {
  const permissions = getPositionPermissions(userRole)
  const hasFilters = Boolean(filters.search || filters.status !== 'all' || filters.department !== 'all')

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (positions.length === 0) {
    return (
      <EmptyState
        hasFilters={hasFilters}
        filters={filters}
        onCreatePosition={onCreatePosition}
        onClearFilters={onClearFilters}
        canCreate={permissions.canCreate}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {positions.map((position) => (
        <PositionCard
          key={position.id}
          position={position}
          departments={departments}
          userRole={userRole}
          onClick={onPositionClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  )
})

PositionsGrid.displayName = 'PositionsGrid'
