import React, { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Users, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { TechnologyDisplayProps } from './types'
import { EmptyState } from './components/EmptyState'
import { getStatusBadgeVariant } from './utils'
import { TechnologyIcon } from './components/TechnologyIcon'

export const TechnologiesList = memo<TechnologyDisplayProps>(({
  technologies,
  onTechnologyClick,
  onEdit,
  onDelete,
  userRole
}) => {
  if (technologies.length === 0) {
    return (
      <EmptyState
        type="no-results"
        onAction={() => {
          // Could trigger filter reset or other action
        }}
      />
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Technology</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {technologies.map((technology) => (
            <TableRow 
              key={technology.id}
              className="cursor-pointer"
              onClick={() => onTechnologyClick(technology)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <TechnologyIcon
                    src={technology.icon}
                    alt={`${technology.name} icon`}
                    size="sm"
                  />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {technology.name}
                      {technology.documentationUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(technology.documentationUrl, '_blank')
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {technology.description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{technology.category}</Badge>
              </TableCell>
              <TableCell>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {technology.version}
                </code>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(technology.status)}>
                  {technology.status.charAt(0).toUpperCase() + technology.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{technology.userCount}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{format(new Date(technology.updatedAt), 'MMM dd, yyyy')}</div>
                  <div className="text-muted-foreground">by {technology.createdBy}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(technology)
                      }}
                      className="gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  )}
                  {onDelete && technology.userCount === 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Technology</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{technology.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(technology.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
})

TechnologiesList.displayName = 'TechnologiesList'