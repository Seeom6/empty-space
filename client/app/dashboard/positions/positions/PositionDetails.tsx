import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { 
  Edit, 
  Trash2, 
  Building, 
  Calendar,
  CheckCircle,
  XCircle,
  User,
  FileText
} from 'lucide-react'
import { Position, Department } from './types'
import { 
  formatPositionStatus, 
  getPositionStatusColor, 
  canEditPosition, 
  canDeletePosition 
} from './utils'

interface PositionDetailsProps {
  position: Position
  departments: Department[]
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  userRole: string
}

export const PositionDetails: React.FC<PositionDetailsProps> = ({
  position,
  departments,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  userRole
}) => {
  const department = departments.find(dept => dept.id === position.departmentId)
  const canEdit = canEditPosition(userRole, position)
  const canDelete = canDeletePosition(userRole, position)
  const statusColor = getPositionStatusColor(position.status)
  const StatusIcon = position.status === 'ACTIVE' ? CheckCircle : XCircle

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${position.name}"? This action cannot be undone.`)) {
      onDelete()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {position.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Position details and information
              </DialogDescription>
            </div>
            <Badge variant="outline" className={`${statusColor} border ml-4`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {formatPositionStatus(position.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <User className="w-4 h-4 mr-2" />
                  Position Name
                </div>
                <p className="text-gray-900">{position.name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <Building className="w-4 h-4 mr-2" />
                  Department
                </div>
                <p className="text-gray-900">
                  {department?.name || 'Unknown Department'}
                </p>
              </div>
            </div>

            {position.description && (
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <FileText className="w-4 h-4 mr-2" />
                  Description
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {position.description}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Metadata</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(position as any).createdAt && (
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created
                  </div>
                  <p className="text-gray-700">
                    {new Date((position as any).createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              {(position as any).updatedAt && (position as any).updatedAt !== (position as any).createdAt && (
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last Updated
                  </div>
                  <p className="text-gray-700">
                    {new Date((position as any).updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Position ID</div>
              <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                {position.id}
              </p>
            </div>
          </div>

          {/* Department Information */}
          {department && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Department Information</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{department.name}</h4>
                      {department.description && (
                        <p className="text-sm text-gray-600 mt-1">{department.description}</p>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={department.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                      }
                    >
                      {department.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex space-x-2">
            {canEdit && (
              <Button
                variant="outline"
                onClick={onEdit}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Position
              </Button>
            )}
            
            {canDelete && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Position
              </Button>
            )}
          </div>
          
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PositionDetails
