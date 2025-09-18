import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter } from 'lucide-react'
import { PositionFilters } from '../types'

interface EmptyStateProps {
  hasFilters: boolean
  filters: PositionFilters
  onCreatePosition: () => void
  onClearFilters: () => void
  canCreate: boolean
}

export const EmptyState = memo<EmptyStateProps>(({
  hasFilters,
  filters,
  onCreatePosition,
  onClearFilters,
  canCreate
}) => {
  if (hasFilters) {
    // Show filtered empty state
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No positions found
        </h3>
        <p className="text-gray-500 text-center mb-6 max-w-md">
          No positions match your current filters. Try adjusting your search criteria or clearing the filters.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </Button>
          {canCreate && (
            <Button
              onClick={onCreatePosition}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Position
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Show general empty state
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Plus className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No positions yet
      </h3>
      <p className="text-gray-500 text-center mb-6 max-w-md">
        Get started by creating your first position. Positions help organize your team structure and define roles within departments.
      </p>
      {canCreate ? (
        <Button
          onClick={onCreatePosition}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Your First Position
        </Button>
      ) : (
        <p className="text-sm text-gray-400">
          Contact your administrator to create positions.
        </p>
      )}
    </div>
  )
})

EmptyState.displayName = 'EmptyState'
