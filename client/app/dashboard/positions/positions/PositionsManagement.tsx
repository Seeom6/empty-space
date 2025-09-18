'use client'

import React, { useState, Suspense, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { ViewMode, BasePositionProps, Position } from './types'
import { PositionsList } from './PositionsList'
import { PositionsGrid } from './PositionsGrid'
import { PositionStats } from './components/PositionStats'
import { PositionFilters } from './components/PositionFilters'
import { ViewModeToggle } from './components/ViewModeToggle'
import { EmptyState } from './components/EmptyState'
import { usePositions, useModalState } from './hooks'
import { getPositionPermissions } from './utils'
import { DEFAULT_POSITION_FILTERS } from './constants'

// Dynamically import modal to reduce initial bundle size
const CreateEditPositionModal = dynamic(
  () => import('./CreateEditPositionModal'),
  { ssr: false }
)

const PositionDetails = dynamic(
  () => import('./PositionDetails'),
  { ssr: false }
)

interface PositionsManagementProps extends BasePositionProps {}

export const PositionsManagement: React.FC<PositionsManagementProps> = ({
  userRole,
  viewMode: initialViewMode = 'grid',
  onViewModeChange
}) => {
  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)

  // Hooks
  const {
    positions,
    departments,
    stats,
    isLoading,
    isStatsLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    filters,
    actions
  } = usePositions()

  const {
    modalState,
    isOpen,
    mode,
    position: selectedPosition,
    isCreateMode,
    isEditMode,
    isViewMode,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    getModalTitle,
    getActionButtonText
  } = useModalState()

  // Permissions
  const permissions = getPositionPermissions(userRole)

  // Debug logging to check data flow
  console.log('🏗️ PositionsManagement render:', {
    positionsCount: positions.length,
    positions: positions.slice(0, 2),
    isLoading,
    error,
    viewMode,
    departmentsCount: departments?.length || 0
  })

  // Event handlers
  const handlePositionClick = useCallback((position: Position) => {
    openViewModal(position)
  }, [openViewModal])

  const handleEditClick = useCallback((position: Position) => {
    openEditModal(position)
  }, [openEditModal])

  const handleCreateClick = useCallback(() => {
    openCreateModal()
  }, [openCreateModal])

  const handleSavePosition = useCallback((positionData: any) => {
    if (isCreateMode) {
      actions.createPosition(positionData)
    } else if (isEditMode && selectedPosition) {
      actions.updatePosition(selectedPosition.id, positionData)
    }
    closeModal()
  }, [isCreateMode, isEditMode, selectedPosition, actions.createPosition, actions.updatePosition, closeModal])

  const handleDeletePosition = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this position? This action cannot be undone.')) {
      actions.deletePosition(id)
    }
  }, [actions.deletePosition])

  const handleFiltersChange = useCallback((newFilters: any) => {
    actions.setFilters(newFilters)
  }, [actions.setFilters])

  const handleClearFilters = useCallback(() => {
    actions.setFilters(DEFAULT_POSITION_FILTERS)
  }, [actions.setFilters])

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    onViewModeChange?.(mode)
  }, [onViewModeChange])

  const handleRefresh = useCallback(() => {
    actions.refreshPositions()
  }, [actions.refreshPositions])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        
        <PositionStats stats={{ total: 0, active: 0, inactive: 0, departments: {} }} isLoading={true} />
        
        <div className="bg-white p-4 rounded-lg border animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-600 text-center mb-4">
          <h3 className="text-lg font-semibold">Error Loading Positions</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Position Management</h1>
          <p className="text-gray-600 mt-1">
            Manage organizational positions and their assignments
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
          
          {permissions.canCreate && (
            <Button
              onClick={handleCreateClick}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Position
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <PositionStats stats={stats} isLoading={isStatsLoading} />

      {/* Filters */}
      <PositionFilters
        filters={filters}
        departments={departments}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Content */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="flex items-center justify-between text-slate-100">
            <span>
              Positions ({positions.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            {viewMode === 'grid' ? (
              <PositionsGrid
                positions={positions}
                departments={departments}
                userRole={userRole}
                viewMode={viewMode}
                filters={filters}
                onViewModeChange={handleViewModeChange}
                onPositionClick={handlePositionClick}
                onEdit={handleEditClick}
                onDelete={handleDeletePosition}
                onView={openViewModal}
                onCreatePosition={handleCreateClick}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <PositionsList
                positions={positions}
                departments={departments}
                userRole={userRole}
                viewMode={viewMode}
                filters={filters}
                onViewModeChange={handleViewModeChange}
                onPositionClick={handlePositionClick}
                onEdit={handleEditClick}
                onDelete={handleDeletePosition}
                onView={openViewModal}
                onCreatePosition={handleCreateClick}
                onClearFilters={handleClearFilters}
              />
            )}
          </Suspense>
        </CardContent>
      </Card>

      {/* Modals */}
      <Suspense fallback={null}>
        {isOpen && (isCreateMode || isEditMode) && (
          <CreateEditPositionModal
            isOpen={isOpen}
            mode={mode as "create" | "edit"}
            position={selectedPosition}
            departments={departments}
            onClose={closeModal}
            onSave={handleSavePosition}
            isLoading={isCreating || isUpdating}
            title={getModalTitle()}
            actionButtonText={getActionButtonText()}
          />
        )}

        {isOpen && isViewMode && selectedPosition && (
          <PositionDetails
            position={selectedPosition}
            departments={departments}
            isOpen={isOpen}
            onClose={closeModal}
            onEdit={() => {
              closeModal()
              handleEditClick(selectedPosition)
            }}
            onDelete={() => {
              closeModal()
              handleDeletePosition(selectedPosition.id)
            }}
            userRole={userRole}
          />
        )}
      </Suspense>
    </div>
  )
}
