'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ViewMode, BaseTechnologyProps } from './types'
import { TechnologiesList } from './TechnologiesList'
import { TechnologiesGrid } from './TechnologiesGrid'
import { CreateEditTechnologyModal } from './CreateEditTechnologyModal'
import { TechnologyDetails } from './TechnologyDetails'
import { TechnologyStats } from './components/TechnologyStats'
import { TechnologyFilters } from './components/TechnologyFilters'
import { ViewModeToggle } from './components/ViewModeToggle'
import { EmptyState } from './components/EmptyState'
import { useTechnologies } from './hooks/useTechnologies'
import { useModalState } from './hooks/useModalState'
import { canManageTechnologies } from './utils'

interface TechnologiesManagementProps extends BaseTechnologyProps {}

export function TechnologiesManagement({ userRole }: TechnologiesManagementProps) {
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
  const handleTechnologyClick = (technology: any) => {
    openViewModal(technology)
  }

  const handleEditClick = (technology: any) => {
    openEditModal(technology)
  }

  const handleCreateClick = () => {
    openCreateModal()
  }

  const handleSaveTechnology = (technology: any) => {
    if (isCreateMode) {
      actions.createTechnology(technology)
    } else if (isEditMode) {
      actions.updateTechnology(technology)
    }
    closeModal()
  }

  const handleDeleteTechnology = (id: string) => {
    actions.deleteTechnology(id)
  }

  const handleFiltersChange = (newFilters: any) => {
    actions.setFilters(newFilters)
  }

  const handleClearFilters = () => {
    actions.setFilters({ search: '', category: 'all', status: 'all' })
  }

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
      <TechnologyStats
        stats={stats}
        technologies={technologies}
      />

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
          <TechnologyFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            className="mb-6"
          />

          {/* Technologies Display */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading technologies...</div>
            </div>
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
    </div>
  )
}