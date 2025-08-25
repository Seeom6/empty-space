import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, Target, CheckCircle, Users, DollarSign } from 'lucide-react'
import { KPIData } from '../types'
import { formatKPIValue, formatTrendValue, getTrendColor } from '../utils'

interface KPICardProps {
  title: string
  data: KPIData
  icon?: string
  className?: string
}

const iconMap = {
  Target,
  CheckCircle,
  TrendingUp,
  Users,
  DollarSign,
  Minus
}

export const KPICard = memo<KPICardProps>(({
  title,
  data,
  icon = 'Target',
  className = ''
}) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Target
  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus
  
  const getIconColorClass = () => {
    switch (icon) {
      case 'Target': return 'text-blue-500'
      case 'CheckCircle': return 'text-green-500'
      case 'TrendingUp': return 'text-purple-500'
      case 'Users': return 'text-indigo-500'
      case 'DollarSign': return 'text-emerald-500'
      default: return 'text-gray-500'
    }
  }

  const getTrendColorClass = () => {
    switch (data.trend) {
      case 'up': return 'text-green-500'
      case 'down': return 'text-red-500'
      case 'stable':
      default: return 'text-gray-500'
    }
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <IconComponent className={`h-4 w-4 ${getIconColorClass()}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {formatKPIValue(data.value, data.format)}
          </div>
          <div className={`text-xs flex items-center gap-1 ${getTrendColorClass()}`}>
            <TrendIcon className="h-3 w-3" />
            {formatTrendValue(data.change)} vs last period
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

KPICard.displayName = 'KPICard'
