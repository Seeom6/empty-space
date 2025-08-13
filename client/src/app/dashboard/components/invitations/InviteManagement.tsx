'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Search, Plus, Copy, Ban, Mail, UserCheck, Calendar } from 'lucide-react'
import { mockInviteCodes, departments } from './mockData'
import { InviteCode, InviteStatus } from './types'
import { CreateInviteModal } from './CreateInviteModal'
import { format } from 'date-fns'

interface InviteManagementProps {
  userRole: string
}

export function InviteManagement({ userRole }: InviteManagementProps) {
  const [invites, setInvites] = useState<InviteCode[]>(mockInviteCodes)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const canManageInvites = userRole === 'Admin' || userRole === 'HR'

  const filteredInvites = invites.filter(invite => {
    const matchesSearch = invite.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invite.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invite.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invite.usedBy && invite.usedBy.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || invite.status === filterStatus
    const matchesDepartment = filterDepartment === 'all' || invite.department === filterDepartment
    
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('Invite code copied to clipboard!')
  }

  const handleRevokeInvite = (inviteId: string) => {
    setInvites(prev => prev.map(invite =>
      invite.id === inviteId ? { ...invite, status: 'revoked' as InviteStatus } : invite
    ))
  }

  const getStatusBadgeVariant = (status: InviteStatus) => {
    switch (status) {
      case 'active': return 'default'
      case 'used': return 'secondary'
      case 'expired': return 'outline'
      case 'revoked': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: InviteStatus) => {
    switch (status) {
      case 'active': return <Mail className="h-3 w-3" />
      case 'used': return <UserCheck className="h-3 w-3" />
      case 'expired': return <Calendar className="h-3 w-3" />
      case 'revoked': return <Ban className="h-3 w-3" />
      default: return <Mail className="h-3 w-3" />
    }
  }

  const getInviteStats = () => {
    const total = invites.length
    const active = invites.filter(i => i.status === 'active').length
    const used = invites.filter(i => i.status === 'used').length
    const expired = invites.filter(i => i.status === 'expired').length

    return { total, active, used, expired }
  }

  const stats = getInviteStats()

  if (!canManageInvites) {
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Employee Invitations</h1>
          <p className="text-muted-foreground mt-1">
            Manage invite codes for new employee registration
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Invite
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Total Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-500" />
              Active Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Pending registration</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-500" />
              Used Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.used}</div>
            <p className="text-xs text-muted-foreground">Successfully registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              Expired Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">Past expiry date</p>
          </CardContent>
        </Card>
      </div>

      {/* Invites Management */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Invites Table */}
          <div className="border rounded-lg">
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
                        <code className="text-sm bg-muted px-2 py-1 rounded">{invite.code}</code>
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
                      <Badge variant={getStatusBadgeVariant(invite.status)} className="gap-1">
                        {getStatusIcon(invite.status)}
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
                              {format(new Date(invite.usedAt), 'MMM dd, yyyy')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(invite.createdAt), 'MMM dd, yyyy')}</div>
                        <div className="text-muted-foreground">by {invite.createdBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(invite.expiresAt), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invite.status === 'active' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-destructive hover:text-destructive"
                              >
                                <Ban className="h-3 w-3" />
                                Revoke
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
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Invite Modal */}
      <CreateInviteModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onInviteCreated={(newInvite) => {
          setInvites(prev => [...prev, newInvite])
        }}
        userRole={userRole}
      />
    </div>
  )
}