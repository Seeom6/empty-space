import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface SkeletonCardProps {
  className?: string
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <Card className={`animate-pulse ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            {/* Technology icon and name */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            {/* Category badge */}
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          {/* Action buttons */}
          <div className="flex gap-1">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        {/* Version and status */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        
        {/* User count and date */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        
        {/* Documentation link */}
        <div className="pt-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export const SkeletonCardGrid: React.FC<{ count?: number; className?: string }> = ({ 
  count = 6, 
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}
