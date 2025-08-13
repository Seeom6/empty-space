import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Shield } from 'lucide-react'

interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'error'
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState = memo<EmptyStateProps>(({
  type,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'no-data':
        return {
          icon: '🛡️',
          defaultTitle: 'No roles yet',
          defaultDescription: 'Get started by creating your first role to manage user permissions.',
          defaultActionLabel: 'Create Role'
        }
      case 'no-results':
        return {
          icon: '🔍',
          defaultTitle: 'No roles found',
          defaultDescription: 'Try adjusting your search or filter criteria to find what you\'re looking for.',
          defaultActionLabel: 'Clear Filters'
        }
      case 'error':
        return {
          icon: '⚠️',
          defaultTitle: 'Something went wrong',
          defaultDescription: 'We encountered an error while loading roles. Please try again.',
          defaultActionLabel: 'Retry'
        }
      default:
        return {
          icon: '📋',
          defaultTitle: 'No data available',
          defaultDescription: 'There is no data to display at the moment.',
          defaultActionLabel: 'Refresh'
        }
    }
  }

  const config = getEmptyStateConfig()

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-muted-foreground max-w-md mx-auto">
        <div className="text-6xl mb-4">{config.icon}</div>
        <h3 className="text-lg font-semibold mb-2">
          {title || config.defaultTitle}
        </h3>
        <p className="text-sm mb-6">
          {description || config.defaultDescription}
        </p>
        {onAction && (
          <Button onClick={onAction} className="gap-2">
            {type === 'no-data' && <Plus className="h-4 w-4" />}
            {type === 'no-results' && <Search className="h-4 w-4" />}
            {type === 'error' && <Shield className="h-4 w-4" />}
            {actionLabel || config.defaultActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
})

EmptyState.displayName = 'EmptyState'
