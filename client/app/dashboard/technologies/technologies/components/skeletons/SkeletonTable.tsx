import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface SkeletonTableProps {
  rows?: number
  className?: string
}

export const SkeletonTableRow: React.FC = () => {
  return (
    <TableRow className="animate-pulse">
      {/* Technology name and icon */}
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </TableCell>
      
      {/* Category */}
      <TableCell>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </TableCell>
      
      {/* Version */}
      <TableCell>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </TableCell>
      
      {/* Status */}
      <TableCell>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </TableCell>
      
      {/* Users */}
      <TableCell>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
      </TableCell>
      
      {/* Updated */}
      <TableCell>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </TableCell>
      
      {/* Actions */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
      </TableCell>
    </TableRow>
  )
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ 
  rows = 5, 
  className = '' 
}) => {
  return (
    <div className={`border rounded-lg ${className}`}>
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
          {Array.from({ length: rows }, (_, index) => (
            <SkeletonTableRow key={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
