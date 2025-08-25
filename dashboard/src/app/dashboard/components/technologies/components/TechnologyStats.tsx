import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Code, Layers, Database, Server } from 'lucide-react'
import { TechnologyStats as TechnologyStatsType, Technology } from '../types'
import { getMostUsedTechnologies } from '../utils'

interface TechnologyStatsProps {
  stats: TechnologyStatsType
  technologies: Technology[]
  className?: string
}

export const TechnologyStats = memo<TechnologyStatsProps>(({
  stats,
  technologies,
  className = ''
}) => {
  const mostUsedTechs = getMostUsedTechnologies(technologies, 2)

  const statsCards = [
    {
      title: 'Total Technologies',
      value: stats.total,
      description: 'All technologies',
      icon: Code,
      color: 'text-blue-500'
    },
    {
      title: 'Active',
      value: stats.active,
      description: 'Currently used',
      icon: Layers,
      color: 'text-green-500'
    },
    {
      title: 'Inactive',
      value: stats.inactive,
      description: 'Not in use',
      icon: Database,
      color: 'text-orange-500'
    },
    {
      title: 'Deprecated',
      value: stats.deprecated,
      description: 'End of life',
      icon: Server,
      color: 'text-red-500'
    }
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 ${className}`}>
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
      
      {/* Most Used Technologies Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Most Used</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {mostUsedTechs.length > 0 ? (
              mostUsedTechs.map(tech => (
                <div key={tech.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 min-w-0">
                    {tech.icon && <span className="flex-shrink-0">{tech.icon}</span>}
                    <span className="truncate" title={tech.name}>{tech.name}</span>
                  </span>
                  <span className="text-muted-foreground flex-shrink-0 ml-1">
                    {tech.userCount}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground">
                No active technologies
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

TechnologyStats.displayName = 'TechnologyStats'
