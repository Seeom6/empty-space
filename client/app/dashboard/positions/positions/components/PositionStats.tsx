import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Building,
  TrendingUp,
  Activity
} from 'lucide-react'
import { PositionStats as PositionStatsType } from '../types'

interface PositionStatsProps {
  stats: PositionStatsType
  isLoading?: boolean
}

export const PositionStats = memo<PositionStatsProps>(({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Safely handle departments object
  const departments = stats.departments || {}
  const departmentCount = Object.keys(departments).length
  const activePercentage = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0

  const statCards = [
    {
      title: 'Total Positions',
      value: stats.total,
      description: 'All positions in system',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Positions',
      value: stats.active,
      description: `${activePercentage}% of total`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Inactive Positions',
      value: stats.inactive,
      description: `${100 - activePercentage}% of total`,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Departments',
      value: departmentCount,
      description: 'With positions',
      icon: Building,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="bg-slate-900 border-slate-700 hover:shadow-lg hover:shadow-slate-900/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <Icon className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
})

PositionStats.displayName = 'PositionStats'
