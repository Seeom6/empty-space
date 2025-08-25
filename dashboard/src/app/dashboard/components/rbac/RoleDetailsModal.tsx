import React, { useState, useEffect, memo, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Shield, Save } from 'lucide-react'
import { Role, Permission, RoleFormData, PERMISSION_CATEGORIES, PermissionCategory } from './types'
import { DEFAULT_ROLE_FORM } from './constants'
import { validateRoleForm, canEditRole, generateId } from './utils'
import { usePermissions } from './hooks/usePermissions'

interface RoleDetailsModalProps {
  role: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (role: Role) => void
  userRole: string
  mode?: 'create' | 'edit' | 'view' | 'duplicate'
}

export const RoleDetailsModal = memo<RoleDetailsModalProps>(({
  role,
  open,
  onOpenChange,
  onSave,
  userRole,
  mode = 'edit'
}) => {
  const [formData, setFormData] = useState<RoleFormData>(DEFAULT_ROLE_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { permissions } = usePermissions()

  const canEdit = canEditRole(userRole, role || {} as Role)
  const isReadOnly = mode === 'view' || !canEdit

  useEffect(() => {
    if (role) {
      setFormData({
        name: mode === 'duplicate' ? `${role.name} (Copy)` : role.name,
        description: role.description,
        permissions: [...role.permissions],
        isActive: role.isActive
      })
    } else {
      setFormData(DEFAULT_ROLE_FORM)
    }
    setErrors({})
  }, [role, mode])

  const handlePermissionToggle = useCallback((permissionId: string) => {
    if (isReadOnly) return

    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }, [isReadOnly])

  const handleCategoryToggle = useCallback((category: string) => {
    if (isReadOnly) return

    const categoryPermissions = permissions
      .filter(p => p.category === category && p.isActive)
      .map(p => p.id)

    const allSelected = categoryPermissions.every(id => formData.permissions.includes(id))

    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => !categoryPermissions.includes(id))
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
      }))
    }
  }, [isReadOnly, permissions, formData.permissions])

  const handleSave = useCallback(() => {
    // Validate form
    const validation = validateRoleForm(formData)
    setErrors(validation.errors)

    if (!validation.isValid) {
      return
    }

    const roleData: Role = {
      id: role?.id || generateId(),
      name: formData.name,
      description: formData.description,
      permissions: formData.permissions,
      isActive: formData.isActive,
      userCount: role?.userCount || 0,
      createdAt: role?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: role?.createdBy || userRole,
      isSystem: role?.isSystem || false
    }

    onSave(roleData)
    onOpenChange(false)
  }, [formData, role, userRole, onSave, onOpenChange])

  const getPermissionsByCategory = useCallback((category: string): Permission[] => {
    return permissions.filter(p => p.category === category && p.isActive)
  }, [permissions])

  const isCategoryFullySelected = useCallback((category: string): boolean => {
    const categoryPermissions = getPermissionsByCategory(category).map(p => p.id)
    return categoryPermissions.length > 0 && categoryPermissions.every(id => formData.permissions.includes(id))
  }, [getPermissionsByCategory, formData.permissions])

  const isCategoryPartiallySelected = useCallback((category: string): boolean => {
    const categoryPermissions = getPermissionsByCategory(category).map(p => p.id)
    return categoryPermissions.some(id => formData.permissions.includes(id)) && !isCategoryFullySelected(category)
  }, [getPermissionsByCategory, formData.permissions, isCategoryFullySelected])

  if (!role) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Edit Role: {role.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="permissions">Permissions Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={role.name === 'Super Admin'}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive ?? true}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    disabled={role.name === 'Super Admin'}
                  />
                  <Badge variant={formData.isActive ? 'default' : 'secondary'}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleDescription">Description</Label>
              <Textarea
                id="roleDescription"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Role Statistics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold">{role.userCount}</div>
                  <p className="text-sm text-muted-foreground">Users Assigned</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">{formData.permissions.length}</div>
                  <p className="text-sm text-muted-foreground">Permissions</p>
                </div>
                <div>
                  <div className="text-sm">{role.createdAt}</div>
                  <p className="text-sm text-muted-foreground">Created</p>
                </div>
                <div>
                  <div className="text-sm">{role.updatedAt}</div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3>Permissions Matrix</h3>
                <p className="text-sm text-muted-foreground">
                  Select permissions for this role. {formData.permissions.length} of {permissions.filter(p => p.isActive).length} permissions selected.
                </p>
              </div>
              <Badge variant="outline">{formData.permissions.length} selected</Badge>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-6">
                {PERMISSION_CATEGORIES.map((category: PermissionCategory) => {
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
                              {categoryPermissions.filter(p => formData.permissions.includes(p.id)).length} / {categoryPermissions.length}
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
                                checked={formData.permissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                disabled={isReadOnly}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <Label
                                  htmlFor={permission.id}
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
          </TabsContent>
        </Tabs>

        <Separator />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name || !formData.description} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

RoleDetailsModal.displayName = 'RoleDetailsModal'