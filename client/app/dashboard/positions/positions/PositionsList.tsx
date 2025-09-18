import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Building
} from 'lucide-react'
import { Position, Department, PositionDisplayProps, PositionFilters } from './types'
import { EmptyState } from './components/EmptyState'
import {
  formatPositionStatus,
  getPositionStatusColor,
  canEditPosition,
  canDeletePosition,
  getPositionPermissions,
  truncateText
} from './utils'

interface PositionsListProps extends PositionDisplayProps {
  departments: Department[]
  isLoading?: boolean
  filters: PositionFilters
  onCreatePosition: () => void
  onClearFilters: () => void
}

export const PositionsList = memo<PositionsListProps>(({
  positions,
  departments,
  userRole,
  isLoading,
  filters,
  onPositionClick,
  onEdit,
  onDelete,
  onView,
  onCreatePosition,
  onClearFilters,
  ...props
}) => {
  // Remove debug logs

  const permissions = getPositionPermissions(userRole)
  const hasFilters = Boolean(filters.search || filters.status !== 'all' || filters.department !== 'all')

  const getDepartmentName = (departmentId: string) => {
    if (!departmentId || departmentId === 'unknown') {
      return 'No Department'
    }

    if (!Array.isArray(departments)) {
      return 'Loading...'
    }

    const department = departments.find(dept => dept.id === departmentId)
    return department?.name || 'Unknown Department'
  }

  const handleRowClick = (position: Position) => {
    if (onPositionClick) {
      onPositionClick(position)
    } else if (onView) {
      onView(position)
    }
  }

  const StatusIcon = ({ status }: { status: Position['status'] }) => {
    return status === 'ACTIVE' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-600" />
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Always show table, even if empty

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 shadow-lg">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-slate-800/50">
            <TableHead className="text-slate-300 font-semibold">Position Name</TableHead>
            <TableHead className="text-slate-300 font-semibold">Department</TableHead>
            <TableHead className="text-slate-300 font-semibold">Description</TableHead>
            <TableHead className="text-slate-300 font-semibold">Status</TableHead>
            <TableHead className="text-slate-300 font-semibold">Created</TableHead>
            <TableHead className="w-[100px] text-slate-300 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.length <= 0 ? (
            <TableRow className="border-slate-700">
              <TableCell colSpan={6} className="text-center py-12 border-slate-700">
                <div className="text-slate-400">
                  No positions found.
                  {onCreatePosition && (
                    <Button
                      variant="link"
                      onClick={onCreatePosition}
                      className="ml-1 p-0 h-auto text-purple-400 hover:text-purple-300"
                    >
                      Create your first position
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : positions.map((position) => {
            const canEdit = canEditPosition(userRole, position)
            const canDelete = canDeletePosition(userRole, position)
            const statusColor = getPositionStatusColor(position.status)

            return (
              <TableRow
                key={position.id}
                className="cursor-pointer hover:bg-slate-800/50 border-slate-700 transition-colors"
                onClick={() => handleRowClick(position)}
              >
                <TableCell className="font-medium border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-100">{position.name}</span>
                  </div>
                </TableCell>

                <TableCell className="border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">
                      {getDepartmentName(position.departmentId)}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell className="border-slate-700">
                  <span className="text-slate-300">
                    {position.description
                      ? truncateText(position.description, 60)
                      : 'No description'
                    }
                  </span>
                </TableCell>

                <TableCell className="border-slate-700">
                  <Badge variant="outline" className={`${statusColor} border border-slate-600 bg-slate-800`}>
                    <StatusIcon status={position.status} />
                    <span className="ml-1">
                      {formatPositionStatus(position.status)}
                    </span>
                  </Badge>
                </TableCell>

                <TableCell className="border-slate-700">
                  <span className="text-slate-400 text-sm">
                    {(position as any).createdAt
                      ? new Date((position as any).createdAt).toLocaleDateString()
                      : 'Unknown'
                    }
                  </span>
                </TableCell>
                
                <TableCell className="border-slate-700">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100 hover:bg-slate-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-600">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onView?.(position)
                        }}
                        className="text-slate-100 focus:bg-slate-700"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {canEdit && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(position)
                          }}
                          className="text-slate-100 focus:bg-slate-700"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Position
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.(position.id)
                          }}
                          className="text-red-400 focus:text-red-300 focus:bg-slate-700"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Position
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
})

PositionsList.displayName = 'PositionsList'
