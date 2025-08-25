import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SkeletonStats } from './SkeletonStats'
import { SkeletonFilters } from './SkeletonFilters'
import { SkeletonCardGrid } from './SkeletonCard'
import { SkeletonTable } from './SkeletonTable'

interface SkeletonPageProps {
  viewMode?: 'grid' | 'list'
  className?: string
}

export const SkeletonPageHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between animate-pulse">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-4 bg-gray-200 rounded w-80"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
  )
}

export const SkeletonViewModeToggle: React.FC = () => {
  return (
    <div className="flex items-center gap-1 animate-pulse">
      <div className="w-8 h-8 bg-gray-200 rounded"></div>
      <div className="w-8 h-8 bg-gray-200 rounded"></div>
    </div>
  )
}

export const SkeletonCardHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-40"></div>
      <SkeletonViewModeToggle />
    </div>
  )
}

export const SkeletonPage: React.FC<SkeletonPageProps> = ({ 
  viewMode = 'grid', 
  className = '' 
}) => {
  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <SkeletonPageHeader />

      {/* Statistics */}
      <SkeletonStats />

      {/* Technologies Management Card */}
      <Card>
        <CardHeader>
          <SkeletonCardHeader />
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <SkeletonFilters className="mb-6" />

          {/* Technologies Display */}
          {viewMode === 'grid' ? (
            <SkeletonCardGrid count={6} />
          ) : (
            <SkeletonTable rows={5} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Skeleton for modal loading
export const SkeletonModal: React.FC<{ title?: string }> = ({ title = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
        <div className="animate-pulse space-y-4">
          {/* Modal header */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
          
          {/* Modal content */}
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          {/* Modal footer */}
          <div className="flex justify-end gap-2 pt-4">
            <div className="h-10 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  )
}

// Skeleton for technology details
export const SkeletonTechnologyDetails: React.FC = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      
      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  )
}
