import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartDataPoint, TimeSeriesData } from '../types'

interface ChartContainerProps {
  config: ChartConfig
  data: ChartDataPoint[] | TimeSeriesData[]
  className?: string
  children: React.ReactNode
}

export const ChartContainer = memo<ChartContainerProps>(({
  config,
  data,
  className = '',
  children
}) => {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{config.title}</CardTitle>
        {config.description && (
          <p className="text-sm text-muted-foreground">{config.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          {data.length > 0 ? (
            children
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p>No data available</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

ChartContainer.displayName = 'ChartContainer'
