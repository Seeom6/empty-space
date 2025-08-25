'use client'

import React, { useState, Suspense, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ViewMode, BaseTechnologyProps } from './types'
import { TechnologiesList } from './TechnologiesList'
import { TechnologiesGrid } from './TechnologiesGrid'
import { TechnologyStats } from './components/TechnologyStats'
import { TechnologyFilters } from './components/TechnologyFilters'
import { ViewModeToggle } from './components/ViewModeToggle'
import { EmptyState } from './components/EmptyState'
import { SkeletonStats, SkeletonFilters, SkeletonCardGrid, SkeletonTable, SkeletonModal } from './components/skeletons'
import { useTechnologies } from './hooks/useTechnologies'
import { useModalState } from './hooks/useModalState'
import { canManageTechnologies } from './utils'
import { useRenderPerformance, monitorMemoryUsage } from './utils/performance'

// Lazy load modal components for better performance
const CreateEditTechnologyModal = dynamic(
  () => import('./CreateEditTechnologyModal').then(mod => ({ default: mod.CreateEditTechnologyModal })),
  {
    loading: () => <SkeletonModal title="Loading form..." />,
    ssr: false,
  }
)

const TechnologyDetails = dynamic(
  () => import('./TechnologyDetails').then(mod => ({ default: mod.TechnologyDetails })),
  {
    loading: () => <SkeletonModal title="Loading details..." />,
    ssr: false,
  }
)

interface TechnologiesManagementProps extends BaseTechnologyProps {}

export function TechnologiesManagement({ userRole }: TechnologiesManagementProps) {
  // Performance monitoring
  const { renderCount } = useRenderPerformance('TechnologiesManagement')

  // Custom hooks for state management
  const {
    technologies,
    filteredTechnologies,
    stats,
    filters,
    isLoading,
    error,
    actions
  } = useTechnologies()

  // Monitor memory usage in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      monitorMemoryUsage('TechnologiesManagement')
    }
  }, [technologies.length])

  // Debug logging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🏗️ TechnologiesManagement state:', {
      technologiesCount: technologies.length,
      filteredTechnologiesCount: filteredTechnologies.length,
      isLoading,
      error,
      filters,
      stats
    });
  }

  const {
    modalState,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    isCreateMode,
    isEditMode,
    isViewMode
  } = useModalState()

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Computed values
  const canManage = canManageTechnologies(userRole)

  // Event handlers
  const handleTechnologyClick = useCallback((technology: any) => {
    openViewModal(technology)
  }, [openViewModal])

  const handleEditClick = useCallback((technology: any) => {
    openEditModal(technology)
  }, [openEditModal])

  const handleCreateClick = useCallback(() => {
    openCreateModal()
  }, [openCreateModal])

  const handleSaveTechnology = useCallback((technology: any) => {
    if (isCreateMode) {
      actions.createTechnology(technology)
    } else if (isEditMode) {
      actions.updateTechnology(technology)
    }
    closeModal()
  }, [isCreateMode, isEditMode, actions.createTechnology, actions.updateTechnology, closeModal])

  const handleDeleteTechnology = useCallback((id: string) => {
    actions.deleteTechnology(id)
  }, [actions.deleteTechnology])

  const handleFiltersChange = useCallback((newFilters: any) => {
    actions.setFilters(newFilters)
  }, [actions.setFilters])

  const handleClearFilters = useCallback(() => {
    actions.setFilters({ search: '', category: 'all', status: 'all' })
  }, [actions.setFilters])

  // Error handling
  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          type="error"
          title="Failed to load technologies"
          description={error}
          actionLabel="Retry"
          onAction={actions.refreshTechnologies}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Technologies</h1>
          <p className="text-muted-foreground mt-1">
            Manage company technologies and track employee usage
          </p>
        </div>
        {canManage && (
          <Button onClick={handleCreateClick} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Technology
          </Button>
        )}
      </div>

      {/* Statistics */}
      {isLoading ? (
        <SkeletonStats />
      ) : (
        <TechnologyStats
          stats={stats}
          technologies={technologies}
        />
      )}

      {/* Technologies Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Company Technologies</CardTitle>
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          {isLoading ? (
            <SkeletonFilters className="mb-6" />
          ) : (
            <TechnologyFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              className="mb-6"
            />
          )}

          {/* Technologies Display */}
          {isLoading ? (
            viewMode === 'grid' ? (
              <SkeletonCardGrid count={6} />
            ) : (
              <SkeletonTable rows={5} />
            )
          ) : viewMode === 'grid' ? (
            <TechnologiesGrid
              technologies={filteredTechnologies}
              onTechnologyClick={handleTechnologyClick}
              onEdit={canManage ? handleEditClick : undefined}
              onDelete={canManage ? handleDeleteTechnology : undefined}
              userRole={userRole}
            />
          ) : (
            <TechnologiesList
              technologies={filteredTechnologies}
              onTechnologyClick={handleTechnologyClick}
              onEdit={canManage ? handleEditClick : undefined}
              onDelete={canManage ? handleDeleteTechnology : undefined}
              userRole={userRole}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <Suspense fallback={null}>
        <CreateEditTechnologyModal
          open={modalState.isOpen && (isCreateMode || isEditMode)}
          onOpenChange={(open) => {
            if (!open) closeModal()
          }}
          technology={modalState.technology || null}
          onSave={handleSaveTechnology}
          userRole={userRole}
        />

        {modalState.technology && (
          <TechnologyDetails
            open={modalState.isOpen && isViewMode}
            onOpenChange={(open) => {
              if (!open) closeModal()
            }}
            technology={modalState.technology}
            onEdit={() => {
              if (modalState.technology) {
                openEditModal(modalState.technology)
              }
            }}
            canEdit={canManage}
            userRole={userRole}
          />
        )}
      </Suspense>
    </div>
  )
}