import React, { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Users, ExternalLink, Eye } from 'lucide-react'
import { Technology } from '../types'
import { getStatusBadgeVariant, getStatusColor, truncateText, canEditTechnology, canDeleteTechnology } from '../utils'
import { DISPLAY_CONFIG } from '../constants'
import { TechnologyIcon } from './TechnologyIcon'

interface TechnologyCardProps {
  technology: Technology
  userRole: string
  onView?: (technology: Technology) => void
  onEdit?: (technology: Technology) => void
  onDelete?: (technologyId: string) => void
  className?: string
}

export const TechnologyCard = memo<TechnologyCardProps>(({
  technology,
  userRole,
  onView,
  onEdit,
  onDelete,
  className = ''
}) => {
  const canEdit = canEditTechnology(userRole, technology)
  const canDelete = canDeleteTechnology(userRole, technology)
  const statusColor = getStatusColor(technology.status)
  const statusVariant = getStatusBadgeVariant(technology.status)

  const handleCardClick = () => {
    onView?.(technology)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(technology)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(technology.id)
  }

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (technology.documentationUrl) {
      window.open(technology.documentationUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Card 
      className={`group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${statusColor.replace('text-', 'border-')} ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <TechnologyIcon
              src={technology.icon}
              alt={`${technology.name} icon`}
              size="lg"
              className="flex-shrink-0"
              priority={false}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate" title={technology.name}>
                {truncateText(technology.name, DISPLAY_CONFIG.maxNameLength)}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={statusVariant} className="text-xs">
                  {technology.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  v{technology.version}
                </span>
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
            
            {technology.documentationUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExternalLink}
                className="h-8 w-8 p-0"
                title="Open documentation"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            
            {canEdit && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
                title="Edit technology"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {canDelete && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Delete technology"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Technology</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{technology.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
          {truncateText(technology.description, DISPLAY_CONFIG.maxDescriptionLength)}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {technology.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{technology.userCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

TechnologyCard.displayName = 'TechnologyCard'
