import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Grid, List } from 'lucide-react'
import { ViewMode } from '../types'

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  className?: string
}

export const ViewModeToggle = memo<ViewModeToggleProps>(({
  viewMode,
  onViewModeChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="gap-2"
        title="Grid view"
      >
        <Grid className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="gap-2"
        title="List view"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </Button>
    </div>
  )
})

ViewModeToggle.displayName = 'ViewModeToggle'
