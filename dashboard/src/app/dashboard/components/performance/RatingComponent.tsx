'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { RATING_DESCRIPTIONS } from './constants'

interface RatingComponentProps {
  rating: number
  onRatingChange: (rating: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function RatingComponent({ 
  rating, 
  onRatingChange, 
  readOnly = false, 
  size = 'md' 
}: RatingComponentProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const starSize = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }[size]

  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }[size]

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (rating >= 3.5) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    if (rating >= 2.5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const handleStarClick = (starRating: number) => {
    if (!readOnly) {
      onRatingChange(starRating)
    }
  }

  const handleStarHover = (starRating: number) => {
    if (!readOnly) {
      setHoverRating(starRating)
    }
  }

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div 
          className="flex items-center gap-1"
          onMouseLeave={handleMouseLeave}
        >
          {[1, 2, 3, 4, 5].map(star => {
            const isActive = star <= displayRating
            const isClickable = !readOnly
            
            return (
              <Star
                key={star}
                className={`${starSize} transition-colors ${
                  isActive 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300'
                } ${isClickable ? 'cursor-pointer hover:text-yellow-400' : ''}`}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
              />
            )
          })}
        </div>
        <span className={`font-medium ${textSize}`}>
          {rating.toFixed(1)}
        </span>
      </div>
      
      {rating > 0 && (
        <div className="space-y-2">
          <Badge variant="outline" className={getRatingColor(rating)}>
            {RATING_DESCRIPTIONS[Math.round(rating) as keyof typeof RATING_DESCRIPTIONS]}
          </Badge>
          
          {!readOnly && hoverRating > 0 && hoverRating !== rating && (
            <div className="text-sm text-muted-foreground">
              Click to rate: {RATING_DESCRIPTIONS[hoverRating as keyof typeof RATING_DESCRIPTIONS]}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Simplified star rating display component for tables and lists
export function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const starSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  }[size]

  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }[size]

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star} 
          className={`${starSize} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      ))}
      <span className={`ml-1 font-medium ${textSize}`}>{rating.toFixed(1)}</span>
    </div>
  )
}