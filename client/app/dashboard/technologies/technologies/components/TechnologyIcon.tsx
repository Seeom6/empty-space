'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Code2 } from 'lucide-react'
import {
  isEmoji,
  isValidImageUrl,
  getOptimizedImageUrl,
  getImagePlaceholder,
  imageLoadingManager,
  trackImagePerformance
} from '../utils/imageOptimization'

interface TechnologyIconProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallbackIcon?: React.ReactNode
  priority?: boolean
}

const sizeMap = {
  sm: { width: 24, height: 24, className: 'w-6 h-6' },
  md: { width: 32, height: 32, className: 'w-8 h-8' },
  lg: { width: 48, height: 48, className: 'w-12 h-12' },
  xl: { width: 64, height: 64, className: 'w-16 h-16' },
}

export const TechnologyIcon: React.FC<TechnologyIconProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  fallbackIcon,
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadStartTime] = useState(() => performance.now())

  const sizeConfig = sizeMap[size]

  // Use optimization utilities
  const isEmojiIcon = src ? isEmoji(src) : false
  const isValidUrl = src ? isValidImageUrl(src) : false
  const optimizedSrc = src && isValidUrl ? getOptimizedImageUrl(src, {
    width: sizeConfig.width,
    height: sizeConfig.height,
    quality: 'medium'
  }) : src

  useEffect(() => {
    if (src) {
      imageLoadingManager.setLoading(src, isLoading)
      imageLoadingManager.setError(src, hasError)
    }
  }, [src, isLoading, hasError])

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true)
    setIsLoading(false)
    if (src) {
      imageLoadingManager.setError(src, true)
      imageLoadingManager.setLoading(src, false)

      // Log error in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.warn(`🖼️ Failed to load image [${alt}]:`, src, event)
      }
    }
  }

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false)
    if (src) {
      imageLoadingManager.setLoading(src, false)

      // Track performance in development
      if (process.env.NODE_ENV === 'development') {
        const metrics = trackImagePerformance(src, loadStartTime, event.currentTarget)
        console.log(`🖼️ Image loaded [${alt}]:`, metrics)
      }
    }
  }

  // Render emoji icon
  if (isEmojiIcon) {
    return (
      <div
        className={`${sizeConfig.className} flex items-center justify-center text-center ${className}`}
        style={{ fontSize: `${sizeConfig.width * 0.6}px` }}
        title={alt}
        role="img"
        aria-label={alt}
      >
        {src}
      </div>
    )
  }

  // Render fallback icon if no src or error occurred
  if (!src || hasError || !isValidUrl) {
    const FallbackIcon = fallbackIcon || <Code2 className={`${sizeConfig.className} text-gray-400`} />
    return (
      <div
        className={`${sizeConfig.className} flex items-center justify-center ${className}`}
        title={alt}
        role="img"
        aria-label={alt}
      >
        {FallbackIcon}
      </div>
    )
  }

  return (
    <div className={`${sizeConfig.className} relative ${className}`}>
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className={`${sizeConfig.className} absolute inset-0 bg-gray-200 animate-pulse rounded`}
          aria-hidden="true"
        />
      )}
      
      {/* Optimized image */}
      <Image
        src={optimizedSrc || src}
        alt={alt}
        width={sizeConfig.width}
        height={sizeConfig.height}
        className={`${sizeConfig.className} object-contain rounded transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        sizes={`${sizeConfig.width}px`}
        placeholder="blur"
        blurDataURL={getImagePlaceholder('blur')}
        quality={85}
        unoptimized={process.env.NODE_ENV === 'development'} // Allow unoptimized in development
      />
    </div>
  )
}

// Higher-order component for technology icons with common props
export const withTechnologyIcon = (defaultProps: Partial<TechnologyIconProps> = {}) => {
  return (props: TechnologyIconProps) => (
    <TechnologyIcon {...defaultProps} {...props} />
  )
}

// Preset components for common use cases
export const TechnologyIconSmall = withTechnologyIcon({ size: 'sm' })
export const TechnologyIconMedium = withTechnologyIcon({ size: 'md' })
export const TechnologyIconLarge = withTechnologyIcon({ size: 'lg' })
export const TechnologyIconXLarge = withTechnologyIcon({ size: 'xl' })

// Avatar-style icon for profile/header use
export const TechnologyAvatar: React.FC<Omit<TechnologyIconProps, 'size'> & { size?: number }> = ({
  src,
  alt,
  size = 48,
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const isEmoji = src && src.length <= 4 && !src.startsWith('http') && !src.startsWith('/')
  const isImageUrl = src && (src.startsWith('http') || src.startsWith('/'))

  if (isEmoji) {
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-gray-100 ${className}`}
        style={{ 
          width: size, 
          height: size, 
          fontSize: `${size * 0.5}px` 
        }}
        title={alt}
      >
        {src}
      </div>
    )
  }

  if (!src || hasError || !isImageUrl) {
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-gray-100 ${className}`}
        style={{ width: size, height: size }}
        title={alt}
      >
        <Code2 className="text-gray-400" style={{ width: size * 0.6, height: size * 0.6 }} />
      </div>
    )
  }

  return (
    <div 
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          aria-hidden="true"
        />
      )}
      
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`object-cover transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={(event) => {
          setHasError(true)
          if (process.env.NODE_ENV === 'development') {
            console.warn(`🖼️ Failed to load avatar image [${alt}]:`, src, event)
          }
        }}
        onLoad={() => setIsLoading(false)}
        sizes={`${size}px`}
        placeholder="blur"
        blurDataURL={getImagePlaceholder('blur')}
        quality={85}
        unoptimized={process.env.NODE_ENV === 'development'} // Allow unoptimized in development
        {...props}
      />
    </div>
  )
}
