import React, { memo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { PayrollSummary } from '../types'
import { formatCurrency, formatPercentage } from '../utils'

interface PayrollStatsProps {
  summary: PayrollSummary
  className?: string
}

export const PayrollStats = memo<PayrollStatsProps>(({
  summary,
  className = ''
}) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="hover:shadow-md transition-shadow border rounded-lg">
            <div className="p-4">
              <div className="text-sm flex items-center gap-2 mb-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  const statsCards = [
    {
      title: 'Total Payroll',
      value: formatCurrency(summary.totalMonthlyPayroll),
      description: `${summary.employeeCount} employees`,
      icon: DollarSign,
      color: 'text-blue-500',
      trend: summary.monthlyTrend.length > 1 ? 
        ((summary.monthlyTrend[0].totalPayroll - summary.monthlyTrend[1].totalPayroll) / summary.monthlyTrend[1].totalPayroll * 100).toFixed(1) + '%' : null
    },
    {
      title: 'Average Salary',
      value: formatCurrency(summary.averageSalary),
      description: 'Per employee',
      icon: Users,
      color: 'text-green-500',
      trend: summary.monthlyTrend.length > 1 ? 
        ((summary.monthlyTrend[0].averageSalary - summary.monthlyTrend[1].averageSalary) / summary.monthlyTrend[1].averageSalary * 100).toFixed(1) + '%' : null
    },
    {
      title: 'Total Bonuses',
      value: formatCurrency(summary.totalBonuses),
      description: formatPercentage(summary.totalBonuses, summary.totalMonthlyPayroll) + ' of payroll',
      icon: TrendingUp,
      color: 'text-purple-500'
    },
    {
      title: 'Pending Payments',
      value: summary.pendingPayments.toString(),
      description: 'Awaiting processing',
      icon: Clock,
      color: 'text-yellow-500'
    },
    {
      title: 'Processing',
      value: summary.upcomingPayments.toString(),
      description: 'In progress',
      icon: CheckCircle,
      color: 'text-blue-500'
    },
    {
      title: 'Failed Payments',
      value: summary.failedPayments.toString(),
      description: 'Require attention',
      icon: AlertTriangle,
      color: 'text-red-500'
    }
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon
        const isNegativeTrend = Boolean(stat.trend && stat.trend.startsWith('-'))

        const getIconColorClass = (color: string) => {
          switch (color) {
            case 'text-blue-500': return 'text-blue-500'
            case 'text-green-500': return 'text-green-500'
            case 'text-purple-500': return 'text-purple-500'
            case 'text-yellow-500': return 'text-yellow-500'
            case 'text-red-500': return 'text-red-500'
            default: return 'text-gray-500'
          }
        }

        const getTrendColorClass = (isNegative: boolean) => {
          return isNegative ? 'text-red-500' : 'text-green-500'
        }

        const getTrendIconClass = (isNegative: boolean) => {
          return isNegative ? 'h-3 w-3 rotate-180' : 'h-3 w-3'
        }

        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <IconComponent className={`h-4 w-4 ${getIconColorClass(stat.color)}`} />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                {stat.trend && (
                  <div className={`text-xs flex items-center gap-1 ${getTrendColorClass(isNegativeTrend)}`}>
                    <TrendingUp className={getTrendIconClass(isNegativeTrend)} />
                    {stat.trend} vs last month
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
})

PayrollStats.displayName = 'PayrollStats'
