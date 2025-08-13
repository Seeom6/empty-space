'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Shield, Users, Settings, History, Plus } from 'lucide-react'
import { RolesManagementView } from './RolesView'
import { UserRoleAssignmentView } from './UserRoleAssignmentView'
import { PermissionLibraryView } from './PermissionLibraryView'
import { AuditLogsView } from './AuditLogsView'
import { RoleDetailsModal } from './RoleDetailsModal'
import { RBACStats } from './components/RBACStats'
import { EmptyState } from './components/EmptyState'
import { BaseRBACProps, Role } from './types'
import { useRoles } from './hooks/useRoles'
import { useModalState } from './hooks/useModalState'
import { canManageRoles } from './utils'

interface RBACManagementProps extends BaseRBACProps {}

export function RBACManagement({ userRole }: RBACManagementProps) {
  const [activeTab, setActiveTab] = useState('roles')

  // Custom hooks for state management
  const { stats, actions: roleActions } = useRoles()
  const { modalState, openCreateModal, closeModal } = useModalState()

  const canManage = canManageRoles(userRole)

  const handleCreateRole = (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    roleActions.createRole(role)
    closeModal()
  }

  if (!canManage) {
    return (
      <div className="p-6">
        <EmptyState
          type="error"
          title="Access Restricted"
          description="You don't have permission to manage roles and permissions. Please contact your administrator for access."
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Role-Based Access Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles, permissions, and access controls across the system
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* RBAC Statistics */}
      <RBACStats stats={stats} />

      {/* RBAC Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            User Assignments
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Settings className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <RolesManagementView userRole={userRole} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserRoleAssignmentView userRole={userRole} />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <PermissionLibraryView userRole={userRole} />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <AuditLogsView userRole={userRole} />
        </TabsContent>
      </Tabs>

      {/* Create Role Modal */}
      <RoleDetailsModal
        role={null}
        open={modalState.isOpen}
        onOpenChange={closeModal}
        onSave={handleCreateRole}
        userRole={userRole}
        mode="create"
      />
    </div>
  )
}