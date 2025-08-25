'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Grid, List } from 'lucide-react'
import { BaseRBACProps, ViewMode, Role, RoleFilters as RoleFiltersType } from './types'
import { RoleCard } from './components/RoleCard'
import { RoleFilters } from './components/RoleFilters'
import { EmptyState } from './components/EmptyState'
import { RoleDetailsModal } from './RoleDetailsModal'
import { useRoles } from './hooks/useRoles'
import { useModalState } from './hooks/useModalState'

interface RolesManagementViewProps extends BaseRBACProps {}

export function RolesManagementView({ userRole }: RolesManagementViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  
  // Custom hooks for state management
  const {
    filteredRoles,
    filters,
    isLoading,
    error,
    actions
  } = useRoles()

  const {
    modalState,
    openEditModal,
    openViewModal,
    openDuplicateModal,
    closeModal
  } = useModalState()

  // Event handlers
  const handleRoleClick = (role: Role) => {
    openViewModal(role)
  }

  const handleEditClick = (role: Role) => {
    openEditModal(role)
  }

  const handleDuplicateClick = (role: Role) => {
    actions.duplicateRole(role)
  }

  const handleDeleteClick = (roleId: string) => {
    actions.deleteRole(roleId)
  }

  const handleSaveRole = (role: Role) => {
    if (modalState.mode === 'edit') {
      actions.updateRole(role)
    }
    closeModal()
  }

  const handleFiltersChange = (newFilters: Partial<RoleFiltersType>) => {
    actions.setFilters(newFilters)
  }

  const handleClearFilters = () => {
    actions.setFilters({ search: '', status: 'all', category: 'all' })
  }

  // Error handling
  if (error) {
    return (
      <div className="space-y-6">
        <EmptyState
          type="error"
          title="Failed to load roles"
          description={error}
          actionLabel="Retry"
          onAction={actions.refreshRoles}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Roles Management</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2"
              >
                <Grid className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <RoleFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            className="mb-6"
          />

          {/* Roles Display */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading roles...</div>
            </div>
          ) : filteredRoles.length === 0 ? (
            <EmptyState
              type="no-results"
              onAction={handleClearFilters}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  userRole={userRole}
                  onView={handleRoleClick}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onDuplicate={handleDuplicateClick}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRoles.map((role) => (
                <Card key={role.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(role)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateClick(role)}
                      >
                        Duplicate
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Details Modal */}
      {modalState.data && (
        <RoleDetailsModal
          role={modalState.data}
          open={modalState.isOpen}
          onOpenChange={closeModal}
          onSave={handleSaveRole}
          userRole={userRole}
          mode={modalState.mode}
        />
      )}
    </div>
  )
}
