import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, UserCheck, Clock, Ban } from 'lucide-react'
import { InviteStats as InviteStatsType } from '../types'

interface InviteStatsProps {
  stats: InviteStatsType
  className?: string
}

export const InviteStats = memo<InviteStatsProps>(({
  stats,
  className = ''
}) => {
  const statsCards = [
    {
      title: 'Total Invites',
      value: stats.totalInvites,
      description: `${stats.activeInvites} active`,
      icon: Mail,
      color: 'text-blue-500'
    },
    {
      title: 'Used Invites',
      value: stats.usedInvites,
      description: 'Successful registrations',
      icon: UserCheck,
      color: 'text-green-500'
    },
    {
      title: 'Expired',
      value: stats.expiredInvites,
      description: 'Past expiry date',
      icon: Clock,
      color: 'text-orange-500'
    },
    {
      title: 'Revoked',
      value: stats.revokedInvites,
      description: 'Manually cancelled',
      icon: Ban,
      color: 'text-red-500'
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

InviteStats.displayName = 'InviteStats'
