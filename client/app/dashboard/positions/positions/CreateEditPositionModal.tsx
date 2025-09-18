import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { Position, Department, PositionFormData, CreatePositionRequest, UpdatePositionRequest } from './types'
import { POSITION_STATUSES, POSITION_STATUS_LABELS } from './constants'
import { validatePositionForm } from './utils'

interface CreateEditPositionModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  position?: Position | null
  departments: Department[]
  onClose: () => void
  onSave: (data: CreatePositionRequest | UpdatePositionRequest) => void
  isLoading?: boolean
  title: string
  actionButtonText: string
}

export const CreateEditPositionModal: React.FC<CreateEditPositionModalProps> = ({
  isOpen,
  mode,
  position,
  departments,
  onClose,
  onSave,
  isLoading = false,
  title,
  actionButtonText
}) => {
  const [formData, setFormData] = useState<PositionFormData>({
    name: '',
    departmentId: '',
    description: '',
    status: 'ACTIVE'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  // Initialize form data when position changes
  useEffect(() => {
    if (mode === 'edit' && position) {
      setFormData({
        name: position.name,
        departmentId: position.departmentId,
        description: position.description || '',
        status: position.status
      })
    } else {
      setFormData({
        name: '',
        departmentId: '',
        description: '',
        status: 'ACTIVE'
      })
    }
    setErrors({})
    setIsDirty(false)
  }, [mode, position, isOpen])

  const handleInputChange = (field: keyof PositionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = validatePositionForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Prepare data for API
    const submitData = {
      name: formData.name.trim(),
      departmentId: formData.departmentId,
      description: formData.description.trim() || undefined,
      status: formData.status
    }

    onSave(submitData)
  }

  const handleClose = () => {
    if (isDirty && !isLoading) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const activeDepartments = departments.filter(dept => 
    !dept.isDeleted && dept.status === 'ACTIVE'
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new position within a department.'
              : 'Update the position information.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Position Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Position Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager"
              className={errors.name ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="departmentId">
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => handleInputChange('departmentId', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.departmentId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {activeDepartments.length === 0 ? (
                  <SelectItem value="" disabled>
                    No active departments available
                  </SelectItem>
                ) : (
                  activeDepartments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.departmentId && (
              <p className="text-sm text-red-600">{errors.departmentId}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the role and responsibilities (optional)"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value as 'ACTIVE' | 'INACTIVE')}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSITION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {POSITION_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warning for no departments */}
          {activeDepartments.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No active departments are available. Please create a department first before adding positions.
              </AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || activeDepartments.length === 0}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              actionButtonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateEditPositionModal
