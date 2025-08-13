import { useState, useCallback, useMemo } from 'react'
import { 
  UseReportBuilderReturn, 
  AnalyticsFilters, 
  SavedReport, 
  ReportModule 
} from '../types'
import { mockSavedReports } from '../mockData'
import { REPORT_MODULES } from '../constants'
import { validateReport, canPerformAction, generateReportFilename } from '../utils'

export const useReportBuilder = (userRole: string): UseReportBuilderReturn => {
  const [reportName, setReportName] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [selectedModule, setSelectedModule] = useState('')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<AnalyticsFilters['dateRange']>({
    from: undefined,
    to: undefined
  })
  const [savedReports, setSavedReports] = useState<SavedReport[]>(mockSavedReports)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get available modules based on user permissions
  const availableModules = useMemo(() => {
    return REPORT_MODULES.filter(module => 
      module.permissions.includes(userRole)
    )
  }, [userRole])

  // Get fields for selected module
  const availableFields = useMemo(() => {
    const module = availableModules.find(m => m.id === selectedModule)
    return module?.fields || []
  }, [availableModules, selectedModule])

  // Toggle field selection
  const toggleField = useCallback((fieldId: string) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldId)) {
        return prev.filter(id => id !== fieldId)
      } else {
        return [...prev, fieldId]
      }
    })
  }, [])

  // Generate report
  const generateReport = useCallback(async () => {
    if (!canPerformAction(userRole, 'canCreateReports')) {
      setError('You do not have permission to create reports')
      return
    }

    const reportData: Partial<SavedReport> = {
      name: reportName,
      description: reportDescription,
      module: selectedModule,
      fields: selectedFields,
      filters: {
        dateRange,
        department: 'All Departments',
        status: 'all',
        search: ''
      }
    }

    const validation = validateReport(reportData)
    if (!validation.isValid) {
      setError(validation.errors.join(', '))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In a real app, this would call the API to generate the report
      console.log('Report generated successfully:', reportData)

      // Create mock download
      const filename = generateReportFilename(reportName, 'pdf')
      const blob = new Blob(['Mock report content'], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Reset form
      setReportName('')
      setReportDescription('')
      setSelectedModule('')
      setSelectedFields([])
      setDateRange({ from: undefined, to: undefined })
    } catch (err) {
      setError('Failed to generate report')
      console.error('Error generating report:', err)
    } finally {
      setIsLoading(false)
    }
  }, [
    userRole,
    reportName,
    reportDescription,
    selectedModule,
    selectedFields,
    dateRange
  ])

  // Save report template
  const saveReport = useCallback(async () => {
    if (!canPerformAction(userRole, 'canCreateReports')) {
      setError('You do not have permission to save reports')
      return
    }

    const reportData: Partial<SavedReport> = {
      name: reportName,
      description: reportDescription,
      module: selectedModule,
      fields: selectedFields,
      filters: {
        dateRange,
        department: 'All Departments',
        status: 'all',
        search: ''
      }
    }

    const validation = validateReport(reportData)
    if (!validation.isValid) {
      setError(validation.errors.join(', '))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate saving report
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newReport: SavedReport = {
        id: `report-${Date.now()}`,
        name: reportName,
        description: reportDescription,
        module: selectedModule,
        fields: selectedFields,
        filters: {
          dateRange,
          department: 'All Departments',
          status: 'all',
          search: ''
        },
        createdBy: userRole,
        createdAt: new Date().toISOString().split('T')[0],
        isPublic: false
      }

      setSavedReports(prev => [newReport, ...prev])

      // Reset form
      setReportName('')
      setReportDescription('')
      setSelectedModule('')
      setSelectedFields([])
      setDateRange({ from: undefined, to: undefined })

      console.log('Report saved successfully:', newReport)
    } catch (err) {
      setError('Failed to save report')
      console.error('Error saving report:', err)
    } finally {
      setIsLoading(false)
    }
  }, [
    userRole,
    reportName,
    reportDescription,
    selectedModule,
    selectedFields,
    dateRange
  ])

  // Delete report
  const deleteReport = useCallback(async (reportId: string) => {
    if (!canPerformAction(userRole, 'canManageReports')) {
      setError('You do not have permission to delete reports')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate deleting report
      await new Promise(resolve => setTimeout(resolve, 500))

      setSavedReports(prev => prev.filter(report => report.id !== reportId))
      console.log('Report deleted successfully:', reportId)
    } catch (err) {
      setError('Failed to delete report')
      console.error('Error deleting report:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userRole])

  // Run saved report
  const runReport = useCallback(async (reportId: string) => {
    const report = savedReports.find(r => r.id === reportId)
    if (!report) {
      setError('Report not found')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate running report
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Update last run date
      setSavedReports(prev => 
        prev.map(r => 
          r.id === reportId 
            ? { ...r, lastRun: new Date().toISOString().split('T')[0] }
            : r
        )
      )

      // Create mock download
      const filename = generateReportFilename(report.name, 'pdf')
      const blob = new Blob(['Mock report content'], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log('Report executed successfully:', report)
    } catch (err) {
      setError('Failed to run report')
      console.error('Error running report:', err)
    } finally {
      setIsLoading(false)
    }
  }, [savedReports])

  return {
    reportName,
    reportDescription,
    selectedModule,
    selectedFields,
    dateRange,
    savedReports,
    availableModules,
    isLoading,
    error,
    actions: {
      setReportName,
      setReportDescription,
      setSelectedModule,
      toggleField,
      setDateRange,
      generateReport,
      saveReport,
      deleteReport,
      runReport
    }
  }
}
