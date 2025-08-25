import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  progress?: number
  trend?: {
    value: number
    isPositive: boolean
  }
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  progress, 
  trend, 
  badge 
}: KPICardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {icon}
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">{title}</h3>
              {badge && (
                <Badge variant={badge.variant || 'default'} className="mt-1">
                  {badge.text}
                </Badge>
              )}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{trend.value}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {progress !== undefined && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}