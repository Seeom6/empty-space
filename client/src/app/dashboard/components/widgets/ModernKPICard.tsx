import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

interface ModernKPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
  className?: string
}

const colorVariants = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-500/10 dark:bg-blue-400/10',
    trend: {
      up: 'text-blue-600 dark:text-blue-400',
      down: 'text-blue-600 dark:text-blue-400',
      neutral: 'text-blue-600 dark:text-blue-400'
    }
  },
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    icon: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-500/10 dark:bg-green-400/10',
    trend: {
      up: 'text-green-600 dark:text-green-400',
      down: 'text-green-600 dark:text-green-400',
      neutral: 'text-green-600 dark:text-green-400'
    }
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    icon: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-500/10 dark:bg-purple-400/10',
    trend: {
      up: 'text-purple-600 dark:text-purple-400',
      down: 'text-purple-600 dark:text-purple-400',
      neutral: 'text-purple-600 dark:text-purple-400'
    }
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    icon: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-500/10 dark:bg-orange-400/10',
    trend: {
      up: 'text-orange-600 dark:text-orange-400',
      down: 'text-orange-600 dark:text-orange-400',
      neutral: 'text-orange-600 dark:text-orange-400'
    }
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
    icon: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-500/10 dark:bg-red-400/10',
    trend: {
      up: 'text-red-600 dark:text-red-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-red-600 dark:text-red-400'
    }
  },
  gray: {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20',
    icon: 'text-gray-600 dark:text-gray-400',
    iconBg: 'bg-gray-500/10 dark:bg-gray-400/10',
    trend: {
      up: 'text-gray-600 dark:text-gray-400',
      down: 'text-gray-600 dark:text-gray-400',
      neutral: 'text-gray-600 dark:text-gray-400'
    }
  }
}

export const ModernKPICard = memo<ModernKPICardProps>(({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color = 'blue',
  className = '' 
}) => {
  const { direction } = useLanguage()
  const colorConfig = colorVariants[color]
  const isRTL = direction === 'rtl'
  
  const getTrendIcon = () => {
    if (!trend) return null
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      case 'neutral':
        return <Minus className="h-3 w-3" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    if (!trend) return ''
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'down':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
      default:
        return ''
    }
  }

  return (
    <Card className={`hover:shadow-md transition-all duration-200 border-0 ${colorConfig.bg} ${className}`}>
      <CardContent className="p-6">
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`p-3 rounded-xl ${colorConfig.iconBg}`}>
            <Icon className={`h-6 w-6 ${colorConfig.icon}`} />
          </div>
          {trend && (
            <Badge 
              variant="secondary" 
              className={`px-2 py-1 text-xs font-medium ${getTrendColor()} border-0`}
            >
              <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {getTrendIcon()}
                <span className="use-latin-numerals">
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
              </div>
            </Badge>
          )}
        </div>
        
        <div className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-white use-latin-numerals">
            {value}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

ModernKPICard.displayName = 'ModernKPICard'