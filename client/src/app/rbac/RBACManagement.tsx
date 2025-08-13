'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Shield, Users, Settings, History, Plus } from 'lucide-react'
import { RolesManagementView } from './RolesManagementView'
import { UserRoleAssignmentView } from './UserRoleAssignmentView'
import { PermissionLibraryView } from './PermissionLibraryView'
import { AuditLogsView } from './AuditLogsView'
import { CreateRoleModal } from './CreateRoleModal'

interface RBACManagementProps {
  userRole: string
}

export function RBACManagement({ userRole }: RBACManagementProps) {
  const [activeTab, setActiveTab] = useState('roles')
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)

  const canManageRoles = userRole === 'Admin'

  if (!canManageRoles) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2>Access Restricted</h2>
            <p className="text-muted-foreground mt-2">
              You don't have permission to manage roles and permissions. Please contact your administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Role-Based Access Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles, permissions, and access controls across the system
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateRoleModal(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* RBAC Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Total Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Active roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72</div>
            <p className="text-xs text-muted-foreground">With active roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">40</div>
            <p className="text-xs text-muted-foreground">System permissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

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
      <CreateRoleModal 
        open={showCreateRoleModal}
        onOpenChange={setShowCreateRoleModal}
      />
    </div>
  )
}