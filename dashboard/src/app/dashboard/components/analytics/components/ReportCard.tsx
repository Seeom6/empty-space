import React, { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Eye, Download, Trash2, Calendar, User, FileText } from 'lucide-react'
import { SavedReport } from '../types'
import { formatDate } from '../utils'

interface ReportCardProps {
  report: SavedReport
  onView?: (reportId: string) => void
  onRun?: (reportId: string) => void
  onDelete?: (reportId: string) => void
  canDelete?: boolean
  className?: string
}

export const ReportCard = memo<ReportCardProps>(({
  report,
  onView,
  onRun,
  onDelete,
  canDelete = false,
  className = ''
}) => {
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    onView?.(report.id)
  }

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRun?.(report.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(report.id)
  }

  const getModuleBadgeColor = (module: string) => {
    switch (module) {
      case 'projects': return 'bg-blue-100 text-blue-800'
      case 'employees': return 'bg-green-100 text-green-800'
      case 'payroll': return 'bg-purple-100 text-purple-800'
      case 'performance': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 cursor-pointer ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate" title={report.name}>
                  {report.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {report.description}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getModuleBadgeColor(report.module)}>
                {report.module.charAt(0).toUpperCase() + report.module.slice(1)}
              </Badge>
              {report.isPublic && (
                <Badge variant="outline" className="text-xs">
                  Public
                </Badge>
              )}
              {report.schedule?.enabled && (
                <Badge variant="outline" className="text-xs">
                  Scheduled
                </Badge>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Created by: {report.createdBy}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Created: {formatDate(report.createdAt)}</span>
              </div>
              {report.lastRun && (
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>Last run: {formatDate(report.lastRun)}</span>
                </div>
              )}
            </div>

            {/* Fields Summary */}
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">{report.fields.length} fields:</span>
              <span className="ml-1">
                {report.fields.slice(0, 3).join(', ')}
                {report.fields.length > 3 && ` +${report.fields.length - 3} more`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleView}
              className="h-8 w-8 p-0"
              title="View report details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRun}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-600"
              title="Run report"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            {canDelete && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Delete report"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Report</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{report.name}"? This action cannot be undone.
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
      </CardContent>
    </Card>
  )
})

ReportCard.displayName = 'ReportCard'
