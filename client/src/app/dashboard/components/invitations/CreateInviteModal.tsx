import React, { useState, useCallback, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Copy, Plus, Mail, CheckCircle } from 'lucide-react'
import { InviteCode, InviteFormData } from './types'
import { DEPARTMENTS, ROLES, DEFAULT_INVITE_FORM, PERMISSION_CATEGORIES } from './constants'
import { validateInviteForm, generateInviteCode, generateId } from './utils'
import { mockPermissions } from '../rbac/mockData'
import toast from 'react-hot-toast'

interface CreateInviteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInviteCreated: (invite: InviteCode) => void
  userRole: string
}

export function CreateInviteModal({ open, onOpenChange, onInviteCreated, userRole }: CreateInviteModalProps) {
  const [formData, setFormData] = useState<InviteFormData>(DEFAULT_INVITE_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generatedCode, setGeneratedCode] = useState('')
  const [isGenerated, setIsGenerated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Memoized permission categories
  const permissionsByCategory = useMemo(() => {
    return PERMISSION_CATEGORIES.reduce((acc, category) => {
      acc[category] = mockPermissions.filter(p => p.category === category && p.isActive)
      return acc
    }, {} as Record<string, typeof mockPermissions>)
  }, [])

  const handleFormChange = useCallback((field: keyof InviteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const handlePermissionToggle = useCallback((permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }, [])

  const handleCategoryToggle = useCallback((category: string) => {
    const categoryPermissions = permissionsByCategory[category]?.map(p => p.id) || []
    const allSelected = categoryPermissions.every(id => formData.permissions.includes(id))

    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(id => !categoryPermissions.includes(id))
        : [...new Set([...prev.permissions, ...categoryPermissions])]
    }))
  }, [permissionsByCategory, formData.permissions])

  const generateInvite = useCallback(async () => {
    try {
      setIsLoading(true)

      // Validate form
      const validation = validateInviteForm(formData)
      if (!validation.isValid) {
        setErrors(validation.errors)
        return
      }

      const code = generateInviteCode()
      setGeneratedCode(code)
      setIsGenerated(true)

      // Create the invite
      const newInvite: InviteCode = {
        id: generateId(),
        code,
        department: formData.department,
        role: formData.role,
        permissions: formData.permissions,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: userRole,
        expiresAt: new Date(Date.now() + formData.expiryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      onInviteCreated(newInvite)
      toast.success('Invite code generated successfully!')
    } catch (error) {
      toast.error('Failed to generate invite code')
    } finally {
      setIsLoading(false)
    }
  }, [formData, userRole, onInviteCreated])

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(generatedCode)
    toast.success('Invite code copied to clipboard!')
  }, [generatedCode])

  const handleReset = useCallback(() => {
    setFormData(DEFAULT_INVITE_FORM)
    setErrors({})
    setGeneratedCode('')
    setIsGenerated(false)
  }, [])

  const handleClose = useCallback(() => {
    handleReset()
    onOpenChange(false)
  }, [handleReset, onOpenChange])

  const isCategoryFullySelected = useCallback((category: string): boolean => {
    const categoryPermissions = permissionsByCategory[category]?.map(p => p.id) || []
    return categoryPermissions.length > 0 && categoryPermissions.every(id => formData.permissions.includes(id))
  }, [permissionsByCategory, formData.permissions])

  const isCategoryPartiallySelected = useCallback((category: string): boolean => {
    const categoryPermissions = permissionsByCategory[category]?.map(p => p.id) || []
    return categoryPermissions.some(id => formData.permissions.includes(id)) && !isCategoryFullySelected(category)
  }, [permissionsByCategory, formData.permissions, isCategoryFullySelected])

  const isFormValid = useMemo(() => {
    return formData.department && formData.role && formData.permissions.length > 0
  }, [formData])

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
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleFormChange('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-red-600">{errors.department}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleFormChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role}</p>
                )}
              </div>
            </div>

            {/* Permissions Selection */}
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Define Permissions</CardTitle>
                  <Badge variant="outline">{formData.permissions.length} selected</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select the permissions this employee will have upon registration.
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {PERMISSION_CATEGORIES.slice(0, 6).map((category) => {
                      const categoryPermissions = permissionsByCategory[category] || []
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
                                  {categoryPermissions.filter((p: any) => formData.permissions.includes(p.id)).length} / {categoryPermissions.length}
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {categoryPermissions.map((permission: any) => (
                                <div key={permission.id} className="flex items-start space-x-2">
                                  <Checkbox
                                    id={permission.id}
                                    checked={formData.permissions.includes(permission.id)}
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
                {errors.permissions && (
                  <p className="text-sm text-red-600 mt-2">{errors.permissions}</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Generated Code Display */
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
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
                    <div>Department: <span className="font-medium">{formData.department}</span></div>
                    <div>Role: <span className="font-medium">{formData.role}</span></div>
                    <div>Permissions: <span className="font-medium">{formData.permissions.length} selected</span></div>
                    <div>Expires: <span className="font-medium">{formData.expiryDays} days from now</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {isGenerated ? 'Close' : 'Cancel'}
          </Button>
          {!isGenerated && (
            <Button
              onClick={generateInvite}
              disabled={!isFormValid || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Generate Invite Code
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}