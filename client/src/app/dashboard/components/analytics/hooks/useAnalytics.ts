import { useState, useCallback, useMemo, useEffect } from 'react'
import { 
  UseAnalyticsReturn, 
  AnalyticsFilters, 
  KPIMetrics, 
  ProjectAnalytics, 
  EmployeeAnalytics, 
  PayrollAnalytics,
  ReportExportOptions
} from '../types'
import { getMockDataForRole } from '../mockData'
import { DEFAULT_FILTERS } from '../constants'
import { applyFilters, canViewModule } from '../utils'

export const useAnalytics = (userRole: string): UseAnalyticsReturn => {
  const [filters, setFiltersState] = useState<AnalyticsFilters>(DEFAULT_FILTERS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get mock data based on user role
  const mockData = useMemo(() => getMockDataForRole(userRole), [userRole])

  // Memoized filtered data
  const filteredData = useMemo(() => {
    // In a real app, this would apply filters to actual data
    // For now, we'll return the mock data as-is since it's already role-filtered
    return mockData
  }, [mockData, filters])

  // Filter update handler
  const setFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Refresh data handler
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, this would fetch fresh data from the API
      console.log('Data refreshed successfully')
    } catch (err) {
      setError('Failed to refresh data')
      console.error('Error refreshing data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Export data handler
  const exportData = useCallback(async (options: ReportExportOptions) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would generate and download the export file
      console.log('Data exported successfully:', options)
      
      // Create a mock download
      const filename = `analytics_export_${new Date().toISOString().split('T')[0]}.${options.format}`
      const blob = new Blob(['Mock export data'], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export data')
      console.error('Error exporting data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        refreshData()
      }
    }, 5 * 60 * 1000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [isLoading, refreshData])

  return {
    kpiData: filteredData.kpiData,
    projectAnalytics: filteredData.projectAnalytics,
    employeeAnalytics: filteredData.employeeAnalytics,
    payrollAnalytics: filteredData.payrollAnalytics,
    filters,
    isLoading,
    error,
    actions: {
      setFilters,
      refreshData,
      exportData
    }
  }
}
