import React from 'react'

interface SkeletonFiltersProps {
  className?: string
}

export const SkeletonFilters: React.FC<SkeletonFiltersProps> = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse ${className}`}>
      {/* Search input */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      
      {/* Category select */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      
      {/* Status select */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      
      {/* Clear filters button */}
      <div className="space-y-2">
        <div className="h-4 bg-transparent rounded w-1"></div> {/* Spacer */}
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  )
}
