'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Copy, Ban, RotateCcw, Eye, Grid, List, Mail } from 'lucide-react'
import { InviteCode } from './types'
import { CreateInviteModal } from './CreateInviteModal'
import { InviteCard } from './components/InviteCard'
import { InviteStats } from './components/InviteStats'
import { InviteFilters } from './components/InviteFilters'
import { useInvites } from './hooks/useInvites'
import { useModalState } from './hooks/useModalState'
import { canManageInvites, getInviteStatusBadgeVariant, formatDate } from './utils'
import toast from 'react-hot-toast'

interface InviteManagementProps {
  userRole: string
}

export function InviteManagement({ userRole }: InviteManagementProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const {
    invites,
    filteredInvites,
    stats,
    filters,
    isLoading,
    error,
    actions
  } = useInvites()

  const {
    modalState,
    openCreateModal,
    closeModal
  } = useModalState<InviteCode>()

  const canManage = canManageInvites(userRole)

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Invite code copied to clipboard!')
  }, [])

  const handleRevokeInvite = useCallback((inviteId: string) => {
    actions.revokeInvite(inviteId)
    toast.success('Invite code revoked successfully!')
  }, [actions])

  const handleResendInvite = useCallback((inviteId: string) => {
    actions.resendInvite(inviteId)
    toast.success('Invite code resent successfully!')
  }, [actions])

  const handleClearFilters = useCallback(() => {
    actions.setFilters({
      search: '',
      status: 'all',
      department: 'all',
      role: 'all',
      dateRange: 'all'
    })
  }, [actions])

  const handleInviteCreated = useCallback((newInvite: InviteCode) => {
    actions.createInvite(newInvite)
    closeModal()
    toast.success('Invite code created successfully!')
  }, [actions, closeModal])

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading invitations</p>
          <Button onClick={actions.refreshInvites} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2>Access Restricted</h2>
            <p className="text-muted-foreground mt-2">
              You don't have permission to manage employee invitations.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Employee Invitations</h2>
          <p className="text-muted-foreground">
            Manage employee invitation codes and track registration status
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Invite
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <InviteStats stats={stats} />

      {/* Filters */}
      <InviteFilters
        filters={filters}
        onFiltersChange={actions.setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Content Display */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
            <p className="text-muted-foreground">Loading invitations...</p>
          </div>
        </div>
      ) : filteredInvites.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No invitations found</h3>
            <p className="text-muted-foreground mb-4">
              {filters.search || filters.status !== 'all' || filters.department !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first employee invitation to get started.'
              }
            </p>
            {(!filters.search && filters.status === 'all' && filters.department === 'all') && (
              <Button onClick={openCreateModal} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Invite
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvites.map((invite) => (
            <InviteCard
              key={invite.id}
              invite={invite}
              userRole={userRole}
              onCopy={handleCopyCode}
              onRevoke={handleRevokeInvite}
              onResend={handleResendInvite}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invite Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Used By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{invite.code}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(invite.code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{invite.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invite.role}</div>
                        <div className="text-sm text-muted-foreground">
                          {invite.permissions.length} permissions
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getInviteStatusBadgeVariant(invite.status)}>
                        {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invite.usedBy ? (
                        <div>
                          <div className="font-medium">{invite.usedBy}</div>
                          <div className="text-sm text-muted-foreground">{invite.usedByEmail}</div>
                          {invite.usedAt && (
                            <div className="text-xs text-muted-foreground">
                              {formatDate(invite.usedAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(invite.createdAt)}</div>
                        <div className="text-muted-foreground">by {invite.createdBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(invite.expiresAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(invite.code)}
                          className="h-8 w-8 p-0"
                          title="Copy code"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>

                        {invite.status === 'active' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendInvite(invite.id)}
                              className="h-8 w-8 p-0"
                              title="Resend invite"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  title="Revoke invite"
                                >
                                  <Ban className="h-3 w-3" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke Invite</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to revoke the invite code "{invite.code}"? 
                                  This action cannot be undone and the code will no longer be usable.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRevokeInvite(invite.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Revoke Invite
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Invite Modal */}
      <CreateInviteModal
        open={modalState.isOpen}
        onOpenChange={closeModal}
        onInviteCreated={handleInviteCreated}
        userRole={userRole}
      />
    </div>
  )
}