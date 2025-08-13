import { useState, useEffect } from 'react'
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
import { Shield, Save, Copy } from 'lucide-react'
import { Role, Permission, PERMISSION_CATEGORIES } from './types'
import { mockPermissions } from './mockData'

interface RoleDetailsModalProps {
  role: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (role: Role) => void
}

export function RoleDetailsModal({ role, open, onOpenChange, onSave }: RoleDetailsModalProps) {
  const [formData, setFormData] = useState<Partial<Role>>({})
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        isActive: role.isActive
      })
      setSelectedPermissions(role.permissions)
    }
  }, [role])

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

  const handleSave = () => {
    if (role && formData.name && formData.description !== undefined) {
      const updatedRole: Role = {
        ...role,
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive ?? true,
        permissions: selectedPermissions,
        updatedAt: new Date().toISOString().split('T')[0]
      }
      onSave(updatedRole)
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
                  <div className="text-2xl font-bold">{selectedPermissions.length}</div>
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
                  Select permissions for this role. {selectedPermissions.length} of {mockPermissions.filter(p => p.isActive).length} permissions selected.
                </p>
              </div>
              <Badge variant="outline">{selectedPermissions.length} selected</Badge>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-6">
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
}