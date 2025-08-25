import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, ExternalLink, Users, Calendar, Plus, Trash2, UserPlus } from 'lucide-react'
import { Technology, TechnologyStatus } from './types'
import { mockTechnologyAssignments, employees } from './mockData'
import { format } from 'date-fns'
import { TechnologyAvatar } from './components/TechnologyIcon'

interface TechnologyDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  technology: Technology
  onEdit: () => void
  canEdit: boolean
  userRole: string
}

export function TechnologyDetails({ 
  open, 
  onOpenChange, 
  technology, 
  onEdit,
  canEdit,
  userRole 
}: TechnologyDetailsProps) {
  const [assignments, setAssignments] = useState(mockTechnologyAssignments)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')

  const techAssignments = assignments.filter(
    assignment => assignment.technologyId === technology.id && assignment.isActive
  )

  const availableEmployees = employees.filter(
    emp => !techAssignments.some(assignment => assignment.userId === emp.id)
  )

  const getStatusBadgeVariant = (status: TechnologyStatus) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'deprecated': return 'destructive'
      default: return 'outline'
    }
  }

  const handleAssignUser = () => {
    if (!selectedEmployee) return

    const employee = employees.find(emp => emp.id === selectedEmployee)
    if (!employee) return

    const newAssignment = {
      id: Date.now().toString(),
      technologyId: technology.id,
      userId: employee.id,
      userName: employee.name,
      userPosition: employee.position,
      assignedAt: new Date().toISOString().split('T')[0],
      assignedBy: userRole,
      isActive: true
    }

    setAssignments(prev => [...prev, newAssignment])
    setSelectedEmployee('')
    setShowAssignModal(false)
  }

  const handleRemoveAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.map(assignment =>
      assignment.id === assignmentId ? { ...assignment, isActive: false } : assignment
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <TechnologyAvatar
                src={technology.icon}
                alt={`${technology.name} icon`}
                size={48}
              />
              <div>
                <div>{technology.name}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {technology.category} • {technology.version}
                </div>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button variant="outline" onClick={onEdit} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              {technology.documentationUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(technology.documentationUrl, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Docs
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto">
          {/* Technology Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={getStatusBadgeVariant(technology.status)}>
                  {technology.status.charAt(0).toUpperCase() + technology.status.slice(1)}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-medium">{techAssignments.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Last Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(technology.updatedAt), 'MMM dd, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{technology.description}</p>
            </CardContent>
          </Card>

          {/* Users Using This Technology */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Users ({techAssignments.length})</CardTitle>
                {canEdit && (
                  <Button 
                    onClick={() => setShowAssignModal(true)} 
                    className="gap-2"
                    disabled={availableEmployees.length === 0}
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign User
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {techAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3>No users assigned</h3>
                  <p className="mt-1">No employees are currently using this technology.</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Assigned Date</TableHead>
                        <TableHead>Assigned By</TableHead>
                        {canEdit && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {techAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {assignment.userName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{assignment.userName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{assignment.userPosition}</Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(assignment.assignedAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{assignment.assignedBy}</TableCell>
                          {canEdit && (
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Remove
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {assignment.userName} from {technology.name}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveAssignment(assignment.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assign User Modal */}
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Assign User to {technology.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Employee</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEmployees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-muted-foreground">{employee.position}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableEmployees.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    All employees are already assigned to this technology.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignUser}
                disabled={!selectedEmployee}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Assign User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}