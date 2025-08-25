import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface SkeletonStatsProps {
  className?: string
}

export const SkeletonStatCard: React.FC = () => {
  return (
    <Card className="animate-pulse hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export const SkeletonMostUsedCard: React.FC = () => {
  return (
    <Card className="animate-pulse hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0"></div>
                <div className="h-3 bg-gray-200 rounded w-16 flex-shrink-0"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-6 flex-shrink-0 ml-2"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export const SkeletonStats: React.FC<SkeletonStatsProps> = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 ${className}`}>
      {/* 4 stat cards */}
      {Array.from({ length: 4 }, (_, index) => (
        <SkeletonStatCard key={index} />
      ))}
      
      {/* Most used technologies card */}
      <SkeletonMostUsedCard />
    </div>
  )
}
