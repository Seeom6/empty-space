import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Grid3X3, List } from 'lucide-react'
import { ViewMode } from '../types'

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export const ViewModeToggle = memo<ViewModeToggleProps>(({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex items-center border rounded-lg p-1 bg-gray-50">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="h-8 px-3"
      >
        <Grid3X3 className="h-4 w-4 mr-1" />
        Grid
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="h-8 px-3"
      >
        <List className="h-4 w-4 mr-1" />
        List
      </Button>
    </div>
  )
})

ViewModeToggle.displayName = 'ViewModeToggle'
