/**
 * Image optimization utilities for the technology management system
 */

// Image configuration constants
export const IMAGE_CONFIG = {
  // Supported image formats
  supportedFormats: ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'],
  
  // Quality settings
  quality: {
    high: 95,
    medium: 85,
    low: 70,
  },
  
  // Size presets
  sizes: {
    thumbnail: { width: 32, height: 32 },
    small: { width: 48, height: 48 },
    medium: { width: 64, height: 64 },
    large: { width: 128, height: 128 },
    xlarge: { width: 256, height: 256 },
  },
  
  // Placeholder configurations
  placeholders: {
    blur: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    shimmer: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZyI+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZmYiIG9mZnNldD0iMjAlIiAvPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZWVlIiBvZmZzZXQ9IjUwJSIgLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmZiIgb2Zmc2V0PSI3MCUiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2IiAvPgogIDxyZWN0IGlkPSJyIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIiAvPgogIDxhbmltYXRlIHhsaW5rOmhyZWY9IiNyIiBhdHRyaWJ1dGVOYW1lPSJ4IiB2YWx1ZXM9Ii0xMDA7IDEwMCIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIC8+Cjwvc3ZnPg==',
  },
  
  // CDN configuration
  cdn: {
    baseUrl: process.env.NEXT_PUBLIC_CDN_URL || '',
    transformations: {
      resize: (width: number, height: number) => `w_${width},h_${height},c_fill`,
      quality: (q: number) => `q_${q}`,
      format: (format: string) => `f_${format}`,
      optimize: 'f_auto,q_auto',
    },
  },
} as const

// Image source validation
export function isValidImageUrl(src: string): boolean {
  if (!src) return false
  
  try {
    const url = new URL(src, window.location.origin)
    const pathname = url.pathname.toLowerCase()
    
    return IMAGE_CONFIG.supportedFormats.some(format => 
      pathname.endsWith(`.${format}`)
    )
  } catch {
    return false
  }
}

// Check if source is an emoji
export function isEmoji(src: string): boolean {
  if (!src) return false
  
  // Simple emoji detection - single character or short string without URL patterns
  return src.length <= 4 && 
         !src.startsWith('http') && 
         !src.startsWith('/') && 
         !src.includes('.')
}

// Generate optimized image URL
export function getOptimizedImageUrl(
  src: string,
  options: {
    width?: number
    height?: number
    quality?: keyof typeof IMAGE_CONFIG.quality
    format?: string
  } = {}
): string {
  if (!src || isEmoji(src)) return src
  
  const { width, height, quality = 'medium', format } = options
  
  // If CDN is configured, use it for transformations
  if (IMAGE_CONFIG.cdn.baseUrl && src.startsWith(IMAGE_CONFIG.cdn.baseUrl)) {
    const transformations = []
    
    if (width && height) {
      transformations.push(IMAGE_CONFIG.cdn.transformations.resize(width, height))
    }
    
    transformations.push(IMAGE_CONFIG.cdn.transformations.quality(IMAGE_CONFIG.quality[quality]))
    
    if (format) {
      transformations.push(IMAGE_CONFIG.cdn.transformations.format(format))
    } else {
      transformations.push(IMAGE_CONFIG.cdn.transformations.optimize)
    }
    
    return `${src}?${transformations.join(',')}`
  }
  
  // For other URLs, return as-is (Next.js Image will handle optimization)
  return src
}

// Generate responsive image sizes
export function generateImageSizes(breakpoints: number[] = [640, 768, 1024, 1280]): string {
  return breakpoints
    .map((bp, index) => {
      if (index === breakpoints.length - 1) {
        return `${bp}px`
      }
      return `(max-width: ${bp}px) ${bp}px`
    })
    .join(', ')
}

// Get appropriate placeholder for image
export function getImagePlaceholder(type: 'blur' | 'shimmer' = 'blur'): string {
  return IMAGE_CONFIG.placeholders[type]
}

// Generate srcSet for responsive images
export function generateSrcSet(
  src: string,
  sizes: Array<{ width: number; height: number }>
): string {
  if (!src || isEmoji(src)) return ''
  
  return sizes
    .map(({ width, height }) => {
      const optimizedUrl = getOptimizedImageUrl(src, { width, height })
      return `${optimizedUrl} ${width}w`
    })
    .join(', ')
}

// Image preloader utility
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!src || isEmoji(src)) {
      resolve()
      return
    }
    
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

// Batch image preloader
export async function preloadImages(sources: string[]): Promise<void> {
  const validSources = sources.filter(src => src && !isEmoji(src))
  
  try {
    await Promise.all(validSources.map(preloadImage))
  } catch (error) {
    console.warn('Some images failed to preload:', error)
  }
}

// Image error handler
export function handleImageError(
  error: Event,
  fallbackSrc?: string,
  onError?: (error: Event) => void
): void {
  const img = error.target as HTMLImageElement
  
  if (fallbackSrc && img.src !== fallbackSrc) {
    img.src = fallbackSrc
  } else {
    // Hide image or show placeholder
    img.style.display = 'none'
  }
  
  onError?.(error)
}

// Image loading state manager
export class ImageLoadingManager {
  private loadingStates = new Map<string, boolean>()
  private errorStates = new Map<string, boolean>()
  
  setLoading(src: string, loading: boolean): void {
    this.loadingStates.set(src, loading)
  }
  
  isLoading(src: string): boolean {
    return this.loadingStates.get(src) ?? false
  }
  
  setError(src: string, error: boolean): void {
    this.errorStates.set(src, error)
  }
  
  hasError(src: string): boolean {
    return this.errorStates.get(src) ?? false
  }
  
  clear(src?: string): void {
    if (src) {
      this.loadingStates.delete(src)
      this.errorStates.delete(src)
    } else {
      this.loadingStates.clear()
      this.errorStates.clear()
    }
  }
}

// Global image loading manager instance
export const imageLoadingManager = new ImageLoadingManager()

// Image optimization metrics
export interface ImageMetrics {
  originalSize?: number
  optimizedSize?: number
  loadTime: number
  format: string
  dimensions: { width: number; height: number }
}

// Performance monitoring for images
export function trackImagePerformance(
  src: string,
  startTime: number,
  img: HTMLImageElement
): ImageMetrics {
  const loadTime = performance.now() - startTime
  const format = src.split('.').pop()?.toLowerCase() || 'unknown'
  
  return {
    loadTime,
    format,
    dimensions: {
      width: img.naturalWidth,
      height: img.naturalHeight,
    },
  }
}

// Image cache utilities
export class ImageCache {
  private cache = new Map<string, string>()
  private maxSize = 50 // Maximum number of cached images
  
  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }
  
  get(key: string): string | undefined {
    return this.cache.get(key)
  }
  
  has(key: string): boolean {
    return this.cache.has(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  size(): number {
    return this.cache.size
  }
}

// Global image cache instance
export const imageCache = new ImageCache()
