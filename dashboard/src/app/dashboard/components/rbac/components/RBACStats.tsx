import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Settings, History } from 'lucide-react'
import { RBACStats as RBACStatsType } from '../types'

interface RBACStatsProps {
  stats: RBACStatsType
  className?: string
}

export const RBACStats = memo<RBACStatsProps>(({
  stats,
  className = ''
}) => {
  const statsCards = [
    {
      title: 'Total Roles',
      value: stats.totalRoles,
      description: `${stats.activeRoles} active`,
      icon: Shield,
      color: 'text-blue-500'
    },
    {
      title: 'Users Assigned',
      value: stats.assignedUsers,
      description: `${stats.totalUsers} total users`,
      icon: Users,
      color: 'text-green-500'
    },
    {
      title: 'Permissions',
      value: stats.totalPermissions,
      description: 'System permissions',
      icon: Settings,
      color: 'text-purple-500'
    },
    {
      title: 'Recent Changes',
      value: stats.recentChanges,
      description: 'Last 7 days',
      icon: History,
      color: 'text-orange-500'
    }
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${className}`}>
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
})

RBACStats.displayName = 'RBACStats'
