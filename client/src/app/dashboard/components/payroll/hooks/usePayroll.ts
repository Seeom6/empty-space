import { useState, useCallback, useMemo } from 'react'
import { PayrollEntry, PayrollFilters, UsePayrollReturn } from '../types'
import { mockPayrollEntries } from '../mockData'
import { 
  filterPayrollEntries, 
  calculatePayrollSummary, 
  generateId, 
  calculateGrossSalary, 
  calculateNetSalary 
} from '../utils'

export const usePayroll = (): UsePayrollReturn => {
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>(mockPayrollEntries)
  const [filters, setFiltersState] = useState<PayrollFilters>({
    search: '',
    month: 'all',
    year: 'all',
    department: 'all',
    status: 'all',
    dateRange: 'all',
    salaryRange: { min: 0, max: Infinity }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized filtered entries
  const filteredEntries = useMemo(() => {
    return filterPayrollEntries(payrollEntries, filters)
  }, [payrollEntries, filters])

  // Memoized summary statistics
  const summary = useMemo(() => {
    return calculatePayrollSummary(payrollEntries)
  }, [payrollEntries])

  // Filter update handler
  const setFilters = useCallback((newFilters: Partial<PayrollFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Create payroll entry
  const createEntry = useCallback((newEntry: Omit<PayrollEntry, 'id' | 'grossSalary' | 'netSalary'>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const grossSalary = calculateGrossSalary(newEntry.baseSalary, newEntry.bonuses)
      const netSalary = calculateNetSalary(grossSalary, newEntry.deductions)
      
      const entry: PayrollEntry = {
        ...newEntry,
        id: generateId(),
        grossSalary,
        netSalary
      }
      
      setPayrollEntries(prev => [entry, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payroll entry')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update payroll entry
  const updateEntry = useCallback((id: string, updates: Partial<PayrollEntry>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      setPayrollEntries(prev => 
        prev.map(entry => {
          if (entry.id === id) {
            const updatedEntry = { ...entry, ...updates }
            
            // Recalculate gross and net salary if bonuses or deductions changed
            if (updates.bonuses || updates.deductions || updates.baseSalary) {
              updatedEntry.grossSalary = calculateGrossSalary(
                updatedEntry.baseSalary, 
                updatedEntry.bonuses
              )
              updatedEntry.netSalary = calculateNetSalary(
                updatedEntry.grossSalary, 
                updatedEntry.deductions
              )
            }
            
            return updatedEntry
          }
          return entry
        })
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payroll entry')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete payroll entry
  const deleteEntry = useCallback((id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      setPayrollEntries(prev => prev.filter(entry => entry.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payroll entry')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Approve payroll entry
  const approveEntry = useCallback((id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      setPayrollEntries(prev => 
        prev.map(entry => 
          entry.id === id 
            ? { 
                ...entry, 
                status: 'Processing' as const,
                approvedAt: new Date().toISOString(),
                approvedBy: 'Current User' // In real app, get from auth context
              }
            : entry
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve payroll entry')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Process payment
  const processPayment = useCallback((id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simulate payment processing
      setTimeout(() => {
        setPayrollEntries(prev => 
          prev.map(entry => 
            entry.id === id 
              ? { 
                  ...entry, 
                  status: 'Paid' as const,
                  processedAt: new Date().toISOString(),
                  processedBy: 'Current User',
                  payslipGenerated: true
                }
              : entry
          )
        )
        setIsLoading(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment')
      setIsLoading(false)
    }
  }, [])

  // Generate payslip
  const generatePayslip = useCallback((id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      setPayrollEntries(prev => 
        prev.map(entry => 
          entry.id === id 
            ? { ...entry, payslipGenerated: true }
            : entry
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate payslip')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh entries (for future API integration)
  const refreshEntries = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Future: API call to refresh data
      // const data = await fetchPayrollEntries()
      // setPayrollEntries(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh payroll entries')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    payrollEntries,
    filteredEntries,
    summary,
    filters,
    isLoading,
    error,
    actions: {
      setFilters,
      createEntry,
      updateEntry,
      deleteEntry,
      approveEntry,
      processPayment,
      generatePayslip,
      refreshEntries
    }
  }
}
