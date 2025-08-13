import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Search, Edit, Trash2, Plus, UserCheck } from 'lucide-react'
import { mockUserRoleAssignments, mockRoles } from './mockData'
import { UserRoleAssignment, Role } from './types'

interface UserRoleAssignmentViewProps {
  userRole: string
}

export function UserRoleAssignmentView({ userRole }: UserRoleAssignmentViewProps) {
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>(mockUserRoleAssignments)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<UserRoleAssignment | null>(null)
  const [newAssignment, setNewAssignment] = useState({
    userName: '',
    userEmail: '',
    roleId: ''
  })

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || assignment.roleId === filterRole
    return matchesSearch && matchesRole && assignment.isActive
  })

  const handleRevokeRole = (assignmentId: string) => {
    setAssignments(prev => prev.map(assignment =>
      assignment.id === assignmentId ? { ...assignment, isActive: false } : assignment
    ))
  }

  const handleChangeRole = (assignment: UserRoleAssignment, newRoleId: string) => {
    const newRole = mockRoles.find(role => role.id === newRoleId)
    if (newRole) {
      setAssignments(prev => prev.map(a =>
        a.id === assignment.id ? {
          ...a,
          roleId: newRoleId,
          roleName: newRole.name,
          assignedAt: new Date().toISOString().split('T')[0],
          assignedBy: userRole
        } : a
      ))
    }
  }

  const handleAssignRole = () => {
    if (newAssignment.userName && newAssignment.userEmail && newAssignment.roleId) {
      const role = mockRoles.find(r => r.id === newAssignment.roleId)
      if (role) {
        const assignment: UserRoleAssignment = {
          id: Date.now().toString(),
          userId: `u${Date.now()}`,
          userName: newAssignment.userName,
          userEmail: newAssignment.userEmail,
          roleId: newAssignment.roleId,
          roleName: role.name,
          assignedAt: new Date().toISOString().split('T')[0],
          assignedBy: userRole,
          isActive: true
        }
        setAssignments(prev => [...prev, assignment])
        setNewAssignment({ userName: '', userEmail: '', roleId: '' })
        setShowAssignModal(false)
      }
    }
  }

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'Super Admin': return 'destructive'
      case 'HR Manager': return 'default'
      case 'Project Manager': return 'secondary'
      case 'Team Lead': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Role Assignments</CardTitle>
            <Button onClick={() => setShowAssignModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Assign Role
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {mockRoles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Assignments Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Assigned By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {assignment.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{assignment.userName}</div>
                          <div className="text-sm text-muted-foreground">{assignment.userEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(assignment.roleName)}>
                        {assignment.roleName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{assignment.assignedAt}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{assignment.assignedBy}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={assignment.roleId}
                          onValueChange={(value) => handleChangeRole(assignment, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {mockRoles.filter(role => role.isActive).map(role => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                              Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Role Access</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke the "{assignment.roleName}" role from {assignment.userName}? 
                                This will remove all associated permissions.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevokeRole(assignment.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Revoke Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Role Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Assign Role to User
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignUserName">User Name</Label>
              <Input
                id="assignUserName"
                value={newAssignment.userName}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, userName: e.target.value }))}
                placeholder="Enter user name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignUserEmail">Email Address</Label>
              <Input
                id="assignUserEmail"
                type="email"
                value={newAssignment.userEmail}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, userEmail: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignRole">Role</Label>
              <Select value={newAssignment.roleId} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, roleId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {mockRoles.filter(role => role.isActive).map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignRole}
              disabled={!newAssignment.userName || !newAssignment.userEmail || !newAssignment.roleId}
              className="gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}