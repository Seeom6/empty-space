import React, { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Users, Shield, Eye, Copy } from 'lucide-react'
import { Role } from '../types'
import { getRoleStatusBadgeVariant, truncateText, canEditRole, canDeleteRole } from '../utils'
import { DISPLAY_CONFIG } from '../constants'

interface RoleCardProps {
  role: Role
  userRole: string
  onView?: (role: Role) => void
  onEdit?: (role: Role) => void
  onDelete?: (roleId: string) => void
  onDuplicate?: (role: Role) => void
  className?: string
}

export const RoleCard = memo<RoleCardProps>(({
  role,
  userRole,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  className = ''
}) => {
  const canEdit = canEditRole(userRole, role)
  const canDelete = canDeleteRole(userRole, role)
  const statusVariant = getRoleStatusBadgeVariant(role.isActive)

  const handleCardClick = () => {
    onView?.(role)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(role)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(role.id)
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDuplicate?.(role)
  }

  return (
    <Card 
      className={`group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${
        role.isActive ? 'border-green-500' : 'border-gray-400'
      } ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-2xl flex-shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate" title={role.name}>
                {truncateText(role.name, DISPLAY_CONFIG.maxNameLength)}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={statusVariant} className="text-xs">
                  {role.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {role.isSystem && (
                  <Badge variant="outline" className="text-xs">
                    System
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCardClick}
              className="h-8 w-8 p-0"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {canEdit && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
                title="Edit role"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {onDuplicate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDuplicate}
                className="h-8 w-8 p-0"
                title="Duplicate role"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            
            {canDelete && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Delete role"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Role</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
                      {role.userCount > 0 && (
                        <span className="block mt-2 text-destructive font-medium">
                          Warning: This role is assigned to {role.userCount} user(s).
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={role.userCount > 0}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {truncateText(role.description, DISPLAY_CONFIG.maxDescriptionLength)}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {role.permissions.length} permissions
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{role.userCount}</span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          <div>Created: {role.createdAt}</div>
          <div>Updated: {role.updatedAt}</div>
        </div>
      </CardContent>
    </Card>
  )
})

RoleCard.displayName = 'RoleCard'
