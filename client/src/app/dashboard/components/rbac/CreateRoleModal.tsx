'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, Plus } from 'lucide-react'
import { Permission, PERMISSION_CATEGORIES } from './types'
import { mockPermissions } from './mockData'

interface CreateRoleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRoleModal({ open, onOpenChange }: CreateRoleModalProps) {
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

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

  const handleCreate = () => {
    if (roleName && roleDescription) {
      // Mock creation - in real app, this would call an API
      console.log('Creating role:', {
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions,
        isActive
      })
      
      // Reset form
      setRoleName('')
      setRoleDescription('')
      setSelectedPermissions([])
      setIsActive(true)
      onOpenChange(false)
      
      alert('Role created successfully!')
    }
  }

  const getPermissionsByCategory = (category: string): Permission[] => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Create New Role
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newRoleName">Role Name</Label>
                  <Input
                    id="newRoleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Enter role name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newRoleDescription">Description</Label>
                <Textarea
                  id="newRoleDescription"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Permissions Selection */}
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Permissions</CardTitle>
                <Badge variant="outline">{selectedPermissions.length} selected</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Select the permissions this role should have. Choose from {mockPermissions.filter(p => p.isActive).length} available permissions.
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {PERMISSION_CATEGORIES.map((category) => {
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
                                  if (ref && 'indeterminate' in ref) {
                                    (ref as any).indeterminate = isCategoryPartiallySelected(category)
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
                                  id={`new-${permission.id}`}
                                  checked={selectedPermissions.includes(permission.id)}
                                  onCheckedChange={() => handlePermissionToggle(permission.id)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <Label
                                    htmlFor={`new-${permission.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!roleName || !roleDescription}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}