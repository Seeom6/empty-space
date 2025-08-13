import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Copy, Plus, Mail } from 'lucide-react'
import { departments, roles } from './mockData'
import { mockPermissions } from '@/app/rbac/mockData'
import { InviteCode } from './types'

// Extract unique permission categories from mockPermissions
const PERMISSION_CATEGORIES = Array.from(
  new Set(mockPermissions.map(p => p.category))
)

interface CreateInviteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInviteCreated: (invite: InviteCode) => void
  userRole: string
}

export function CreateInviteModal({ open, onOpenChange, onInviteCreated, userRole }: CreateInviteModalProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [generatedCode, setGeneratedCode] = useState('')
  const [isGenerated, setIsGenerated] = useState(false)

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleCategoryToggle = (category: string) => {
    const categoryPermissions = mockPermissions
      .filter(p => p.category === category && p.isActive)
      .map(p => p.id)
    
    const allSelected = categoryPermissions.every(id => selectedPermissions.includes(id))
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !categoryPermissions.includes(id)))
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...categoryPermissions])])
    }
  }

  const generateInviteCode = () => {
    const code = `INV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    setGeneratedCode(code)
    setIsGenerated(true)

    // Create the invite
    const newInvite: InviteCode = {
      id: Date.now().toString(),
      code,
      department: selectedDepartment,
      role: selectedRole,
      permissions: selectedPermissions,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: userRole,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    }

    onInviteCreated(newInvite)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    alert('Invite code copied to clipboard!')
  }

  const handleReset = () => {
    setSelectedDepartment('')
    setSelectedRole('')
    setSelectedPermissions([])
    setGeneratedCode('')
    setIsGenerated(false)
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const getPermissionsByCategory = (category: string) => {
    return mockPermissions.filter(p => p.category === category && p.isActive)
  }

  const isCategoryFullySelected = (category: string): boolean => {
    const categoryPermissions = getPermissionsByCategory(category).map(p => p.id)
    return categoryPermissions.length > 0 && categoryPermissions.every(id => selectedPermissions.includes(id))
  }

  const isCategoryPartiallySelected = (category: string): boolean => {
    const categoryPermissions = getPermissionsByCategory(category).map(p => p.id)
    return categoryPermissions.some(id => selectedPermissions.includes(id)) && !isCategoryFullySelected(category)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Create Employee Invite
          </DialogTitle>
        </DialogHeader>

        {!isGenerated ? (
          <div className="space-y-6 flex-1">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Permissions Selection */}
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Define Permissions</CardTitle>
                  <Badge variant="outline">{selectedPermissions.length} selected</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select the permissions this employee will have upon registration.
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {PERMISSION_CATEGORIES.slice(0, 6).map((category) => {
                      const categoryPermissions = getPermissionsByCategory(category)
                      if (categoryPermissions.length === 0) return null

                      return (
                        <Card key={category}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{category}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isCategoryFullySelected(category)}
                                  ref={(ref) => {
                                    if (ref) {
                                      ref.indeterminate = isCategoryPartiallySelected(category)
                                    }
                                  }}
                                  onCheckedChange={() => handleCategoryToggle(category)}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length} / {categoryPermissions.length}
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {categoryPermissions.map((permission) => (
                                <div key={permission.id} className="flex items-start space-x-2">
                                  <Checkbox
                                    id={permission.id}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                  />
                                  <div className="grid gap-1.5 leading-none">
                                    <Label
                                      htmlFor={permission.id}
                                      className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                      {permission.name}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      {permission.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Generated Code Display */
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Invite Code Generated!</h3>
              <p className="text-muted-foreground mt-1">
                Share this code with the new employee to complete their registration.
              </p>
            </div>
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-lg font-mono bg-muted px-4 py-2 rounded">{generatedCode}</code>
                    <Button variant="outline" size="sm" onClick={handleCopyCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Department: <span className="font-medium">{selectedDepartment}</span></div>
                    <div>Role: <span className="font-medium">{selectedRole}</span></div>
                    <div>Permissions: <span className="font-medium">{selectedPermissions.length} selected</span></div>
                    <div>Expires: <span className="font-medium">30 days from now</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            {isGenerated ? 'Close' : 'Cancel'}
          </Button>
          {!isGenerated && (
            <Button 
              onClick={generateInviteCode}
              disabled={!selectedDepartment || !selectedRole || selectedPermissions.length === 0}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Generate Invite Code
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}