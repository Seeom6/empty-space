import React from "react"

/**
 * Performance monitoring utilities for the technology management system
 */

// Performance metrics interface
export interface PerformanceMetrics {
  componentLoadTime: number
  bundleSize?: number
  renderTime: number
  memoryUsage?: number
  timestamp: number
}

// Performance observer for measuring component load times
export class ComponentPerformanceObserver {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private observer?: PerformanceObserver

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObserver()
    }
  }

  private initializeObserver() {
    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name.includes('technology-component')) {
            this.recordMetric(entry.name, {
              componentLoadTime: entry.duration,
              renderTime: entry.duration,
              timestamp: Date.now(),
            })
          }
        })
      })

      this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] })
    } catch (error) {
      console.warn('Performance observer not supported:', error)
    }
  }

  // Record a performance metric
  recordMetric(componentName: string, metrics: Partial<PerformanceMetrics>) {
    const existing = this.metrics.get(componentName) || {
      componentLoadTime: 0,
      renderTime: 0,
      timestamp: Date.now(),
    }

    this.metrics.set(componentName, {
      ...existing,
      ...metrics,
      timestamp: Date.now(),
    })

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance [${componentName}]:`, metrics)
    }
  }

  // Get metrics for a specific component
  getMetrics(componentName: string): PerformanceMetrics | undefined {
    return this.metrics.get(componentName)
  }

  // Get all metrics
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics)
  }

  // Clear metrics
  clearMetrics() {
    this.metrics.clear()
  }

  // Disconnect observer
  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// Singleton instance
export const performanceObserver = new ComponentPerformanceObserver()

// Higher-order component for measuring component performance
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  const PerformanceMonitoredComponent = (props: P) => {
    const startTime = React.useRef<number>(0)

    React.useEffect(() => {
      startTime.current = performance.now()
      
      return () => {
        const endTime = performance.now()
        const renderTime = endTime - startTime.current
        
        performanceObserver.recordMetric(componentName, {
          componentLoadTime: renderTime,
          renderTime,
          timestamp: Date.now(),
        })
      }
    }, [])

    return React.createElement(WrappedComponent, props)
  }

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`
  
  return PerformanceMonitoredComponent
}

// Hook for measuring render performance
export function useRenderPerformance(componentName: string) {
  const renderStartTime = React.useRef<number>(0)
  const [renderCount, setRenderCount] = React.useState(0)

  React.useEffect(() => {
    renderStartTime.current = performance.now()
    setRenderCount(prev => prev + 1)
  })

  React.useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current
    
    performanceObserver.recordMetric(`${componentName}-render-${renderCount}`, {
      componentLoadTime: renderTime,
      renderTime,
      timestamp: Date.now(),
    })
  })

  return {
    renderCount,
    getMetrics: () => performanceObserver.getMetrics(componentName),
  }
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  // Estimate bundle size based on loaded scripts
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  let totalSize = 0

  scripts.forEach(script => {
    const src = script.getAttribute('src')
    if (src && src.includes('technologies')) {
      // This is a rough estimation - in a real app you'd use webpack-bundle-analyzer
      fetch(src, { method: 'HEAD' })
        .then(response => {
          const contentLength = response.headers.get('content-length')
          if (contentLength) {
            totalSize += parseInt(contentLength, 10)
            console.log(`📦 Bundle size estimate: ${(totalSize / 1024).toFixed(2)} KB`)
          }
        })
        .catch(() => {
          // Ignore errors in development
        })
    }
  })
}

// Memory usage monitoring
export function monitorMemoryUsage(componentName: string) {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return
  }

  const memory = (performance as any).memory
  if (memory) {
    performanceObserver.recordMetric(componentName, {
      componentLoadTime: 0,
      renderTime: 0,
      memoryUsage: memory.usedJSHeapSize,
      timestamp: Date.now(),
    })

    if (process.env.NODE_ENV === 'development') {
      console.log(`🧠 Memory usage [${componentName}]:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      })
    }
  }
}

// Performance report generator
export function generatePerformanceReport(): string {
  const metrics = performanceObserver.getAllMetrics()
  const report = ['📊 Technology Management Performance Report', '']

  metrics.forEach((metric, componentName) => {
    report.push(`Component: ${componentName}`)
    report.push(`  Load Time: ${metric.componentLoadTime.toFixed(2)}ms`)
    report.push(`  Render Time: ${metric.renderTime.toFixed(2)}ms`)
    if (metric.memoryUsage) {
      report.push(`  Memory Usage: ${(metric.memoryUsage / 1024 / 1024).toFixed(2)} MB`)
    }
    report.push(`  Timestamp: ${new Date(metric.timestamp).toISOString()}`)
    report.push('')
  })

  return report.join('\n')
}

// Export performance data for analysis
export function exportPerformanceData(): PerformanceMetrics[] {
  const metrics = performanceObserver.getAllMetrics()
  return Array.from(metrics.values())
}
