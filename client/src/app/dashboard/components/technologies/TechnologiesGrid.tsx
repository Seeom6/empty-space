import React, { memo } from 'react'
import { TechnologyDisplayProps } from './types'
import { TechnologyCard } from './components/TechnologyCard'
import { EmptyState } from './components/EmptyState'
import { DISPLAY_CONFIG } from './constants'

export const TechnologiesGrid = memo<TechnologyDisplayProps>(({
  technologies,
  onTechnologyClick,
  onEdit,
  onDelete,
  userRole
}) => {
  if (technologies.length === 0) {
    return (
      <EmptyState
        type="no-results"
        onAction={() => {
          // Could trigger filter reset or other action
        }}
      />
    )
  }

  return (
    <div
      className={`grid gap-4 grid-cols-1 md:grid-cols-${DISPLAY_CONFIG.gridColumns.md} lg:grid-cols-${DISPLAY_CONFIG.gridColumns.lg} xl:grid-cols-${DISPLAY_CONFIG.gridColumns.xl}`}
    >
      {technologies.map((technology) => (
        <TechnologyCard
          key={technology.id}
          technology={technology}
          userRole={userRole}
          onView={onTechnologyClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
})

TechnologiesGrid.displayName = 'TechnologiesGrid'