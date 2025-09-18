import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Edit, 
  Trash2, 
  Eye, 
  Building, 
  CheckCircle, 
  XCircle,
  MoreHorizontal 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Position, Department, PositionActionProps } from '../types'
import { 
  formatPositionStatus, 
  getPositionStatusColor, 
  canEditPosition, 
  canDeletePosition,
  truncateText 
} from '../utils'

interface PositionCardProps extends PositionActionProps {
  position: Position
  departments: Department[]
  userRole: string
  onClick?: (position: Position) => void
}

export const PositionCard = memo<PositionCardProps>(({
  position,
  departments,
  userRole,
  onClick,
  onEdit,
  onDelete,
  onView
}) => {
  const department = departments.find(dept => dept.id === position.departmentId)
  const canEdit = canEditPosition(userRole, position)
  const canDelete = canDeletePosition(userRole, position)

  const handleCardClick = () => {
    if (onClick) {
      onClick(position)
    } else if (onView) {
      onView(position)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(position)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(position.id)
  }

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    onView?.(position)
  }

  const statusColor = getPositionStatusColor(position.status)
  const StatusIcon = position.status === 'ACTIVE' ? CheckCircle : XCircle

  return (
    <Card 
      className="group hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {position.name}
            </CardTitle>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Building className="w-4 h-4 mr-1" />
              <span className="truncate">
                {department?.name || 'Unknown Department'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-2">
            <Badge 
              variant="outline" 
              className={`${statusColor} border`}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {formatPositionStatus(position.status)}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {canEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Position
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Position
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {position.description && (
          <p className="text-sm text-gray-600 mb-3">
            {truncateText(position.description, 120)}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Created: {(position as any).createdAt ? new Date((position as any).createdAt).toLocaleDateString() : 'Unknown'}
          </span>
          {(position as any).updatedAt && (position as any).updatedAt !== (position as any).createdAt && (
            <span>
              Updated: {new Date((position as any).updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

PositionCard.displayName = 'PositionCard'
