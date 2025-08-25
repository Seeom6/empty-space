import React, { useState, useEffect, memo, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Plus, Code } from 'lucide-react'
import { Technology, TechnologyFormData, TechnologyCategory, TechnologyStatus } from './types'
import { TECHNOLOGY_CATEGORIES, TECHNOLOGY_STATUSES, DEFAULT_TECHNOLOGY_FORM } from './constants'
import { validateTechnologyForm, generateId } from './utils'

interface CreateEditTechnologyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  technology: Technology | null
  onSave: (technology: Technology) => void
  userRole: string
}

export const CreateEditTechnologyModal = memo<CreateEditTechnologyModalProps>(({
  open,
  onOpenChange,
  technology,
  onSave,
  userRole
}) => {
  const [formData, setFormData] = useState<TechnologyFormData>(DEFAULT_TECHNOLOGY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!technology

  useEffect(() => {
    if (technology) {
      setFormData({
        name: technology.name,
        category: technology.category,
        description: technology.description,
        status: technology.status,
        version: technology.version,
        icon: technology.icon || '',
        documentationUrl: technology.documentationUrl || ''
      })
    } else {
      setFormData({
        name: '',
        category: '',
        description: '',
        status: 'active',
        version: '',
        icon: '',
        documentationUrl: ''
      })
    }
  }, [technology])

  const handleSave = useCallback(() => {
    // Validate form
    const validation = validateTechnologyForm(formData)
    setErrors(validation.errors)

    if (!validation.isValid) {
      return
    }

    const technologyData: Technology = {
      id: technology?.id || generateId(),
      name: formData.name,
      category: formData.category as TechnologyCategory,
      description: formData.description,
      status: formData.status,
      version: formData.version,
      icon: formData.icon || undefined,
      documentationUrl: formData.documentationUrl || undefined,
      userCount: technology?.userCount || 0,
      createdAt: technology?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: technology?.createdBy || userRole
    }

    onSave(technologyData)
    onOpenChange(false)
  }, [formData, technology, userRole, onSave, onOpenChange])

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            {isEditing ? 'Edit Technology' : 'Add New Technology'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Technology Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., React, Node.js, PostgreSQL"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: TechnologyCategory) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TECHNOLOGY_CATEGORIES.map((category: TechnologyCategory) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the technology..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    placeholder="e.g., 18.2.0, v20.10.0"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: TechnologyStatus) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    placeholder="e.g., ⚛️, 🟢, 🐳"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Single emoji to represent the technology
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentation">Documentation URL</Label>
                  <Input
                    id="documentation"
                    type="url"
                    placeholder="https://example.com/docs"
                    value={formData.documentationUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentationUrl: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.name && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="text-2xl">{formData.icon || '⚙️'}</div>
                  <div className="flex-1">
                    <div className="font-medium">{formData.name}</div>
                    <div className="text-sm text-muted-foreground">{formData.version}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formData.category}</Badge>
                    <Badge variant={formData.status === 'active' ? 'default' : formData.status === 'inactive' ? 'secondary' : 'destructive'}>
                      {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                {formData.description && (
                  <p className="text-sm text-muted-foreground mt-2">{formData.description}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.name || !formData.category || !formData.description || !formData.version}
            className="gap-2"
          >
            {isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEditing ? 'Save Changes' : 'Add Technology'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

CreateEditTechnologyModal.displayName = 'CreateEditTechnologyModal'