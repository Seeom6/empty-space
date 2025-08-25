import { useState, useCallback, useMemo } from 'react'
import { PayrollFormData, PayrollBonus, PayrollDeduction, ValidationResult } from '../types'
import { DEFAULT_PAYROLL_FORM } from '../constants'
import { validatePayrollForm, calculateGrossSalary, calculateNetSalary, generateId } from '../utils'

interface UsePayrollFormReturn {
  formData: PayrollFormData
  errors: Record<string, string>
  isValid: boolean
  grossSalary: number
  netSalary: number
  actions: {
    updateField: (field: keyof PayrollFormData, value: any) => void
    addBonus: (bonus: Omit<PayrollBonus, 'id'>) => void
    updateBonus: (id: string, updates: Partial<PayrollBonus>) => void
    removeBonus: (id: string) => void
    addDeduction: (deduction: Omit<PayrollDeduction, 'id'>) => void
    updateDeduction: (id: string, updates: Partial<PayrollDeduction>) => void
    removeDeduction: (id: string) => void
    validateForm: () => ValidationResult
    resetForm: () => void
    setFormData: (data: PayrollFormData) => void
  }
}

export const usePayrollForm = (initialData?: Partial<PayrollFormData>): UsePayrollFormReturn => {
  const [formData, setFormDataState] = useState<PayrollFormData>({
    ...DEFAULT_PAYROLL_FORM,
    ...initialData
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Memoized calculations
  const grossSalary = useMemo(() => {
    return calculateGrossSalary(formData.baseSalary, formData.bonuses)
  }, [formData.baseSalary, formData.bonuses])

  const netSalary = useMemo(() => {
    return calculateNetSalary(grossSalary, formData.deductions)
  }, [grossSalary, formData.deductions])

  const isValid = useMemo(() => {
    const validation = validatePayrollForm(formData)
    return validation.isValid
  }, [formData])

  // Update form field
  const updateField = useCallback((field: keyof PayrollFormData, value: any) => {
    setFormDataState(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  // Bonus management
  const addBonus = useCallback((bonus: Omit<PayrollBonus, 'id'>) => {
    const newBonus: PayrollBonus = {
      ...bonus,
      id: generateId()
    }
    
    setFormDataState(prev => ({
      ...prev,
      bonuses: [...prev.bonuses, newBonus]
    }))
  }, [])

  const updateBonus = useCallback((id: string, updates: Partial<PayrollBonus>) => {
    setFormDataState(prev => ({
      ...prev,
      bonuses: prev.bonuses.map(bonus =>
        bonus.id === id ? { ...bonus, ...updates } : bonus
      )
    }))
  }, [])

  const removeBonus = useCallback((id: string) => {
    setFormDataState(prev => ({
      ...prev,
      bonuses: prev.bonuses.filter(bonus => bonus.id !== id)
    }))
  }, [])

  // Deduction management
  const addDeduction = useCallback((deduction: Omit<PayrollDeduction, 'id'>) => {
    const newDeduction: PayrollDeduction = {
      ...deduction,
      id: generateId()
    }
    
    setFormDataState(prev => ({
      ...prev,
      deductions: [...prev.deductions, newDeduction]
    }))
  }, [])

  const updateDeduction = useCallback((id: string, updates: Partial<PayrollDeduction>) => {
    setFormDataState(prev => ({
      ...prev,
      deductions: prev.deductions.map(deduction =>
        deduction.id === id ? { ...deduction, ...updates } : deduction
      )
    }))
  }, [])

  const removeDeduction = useCallback((id: string) => {
    setFormDataState(prev => ({
      ...prev,
      deductions: prev.deductions.filter(deduction => deduction.id !== id)
    }))
  }, [])

  // Form validation
  const validateForm = useCallback((): ValidationResult => {
    const validation = validatePayrollForm(formData)
    setErrors(validation.errors)
    return validation
  }, [formData])

  // Reset form
  const resetForm = useCallback(() => {
    setFormDataState(DEFAULT_PAYROLL_FORM)
    setErrors({})
  }, [])

  // Set form data (for editing)
  const setFormData = useCallback((data: PayrollFormData) => {
    setFormDataState(data)
    setErrors({})
  }, [])

  return {
    formData,
    errors,
    isValid,
    grossSalary,
    netSalary,
    actions: {
      updateField,
      addBonus,
      updateBonus,
      removeBonus,
      addDeduction,
      updateDeduction,
      removeDeduction,
      validateForm,
      resetForm,
      setFormData
    }
  }
}
