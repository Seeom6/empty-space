import { useState, useCallback, useMemo } from 'react'
import { RegistrationData, RegistrationStep, UseRegistrationReturn, RegistrationFormData } from '../types'
import { DEFAULT_REGISTRATION_FORM, REGISTRATION_STEPS } from '../constants'
import { validateRegistrationForm } from '../utils'

export const useRegistration = (): UseRegistrationReturn => {
  const [currentStep, setCurrentStep] = useState(0)
  const [registrationData, setRegistrationData] = useState<RegistrationData>(DEFAULT_REGISTRATION_FORM)
  const [errors, setErrors] = useState<Partial<RegistrationData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized form data
  const formData: RegistrationFormData = useMemo(() => ({
    step: currentStep,
    data: registrationData,
    errors,
    isValid: Object.keys(errors).length === 0
  }), [currentStep, registrationData, errors])

  // Memoized steps with completion status
  const steps: RegistrationStep[] = useMemo(() => {
    return REGISTRATION_STEPS.map((step, index) => ({
      ...step,
      completed: currentStep > index,
      isActive: currentStep === index
    }))
  }, [currentStep])

  // Update registration data
  const updateData = useCallback((newData: Partial<RegistrationData>) => {
    setRegistrationData(prev => ({ ...prev, ...newData }))
    
    // Clear errors for updated fields
    const updatedFields = Object.keys(newData)
    setErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => {
        delete newErrors[field as keyof RegistrationData]
      })
      return newErrors
    })
  }, [])

  // Validate current step
  const validateStep = useCallback((step: number): boolean => {
    const validation = validateRegistrationForm(registrationData, step + 1)
    setErrors(validation.errors)
    return validation.isValid
  }, [registrationData])

  // Move to next step
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, REGISTRATION_STEPS.length - 1))
    }
  }, [currentStep, validateStep])

  // Move to previous step
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
    setErrors({}) // Clear errors when going back
  }, [])

  // Submit registration
  const submitRegistration = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Validate all steps
      const validation = validateRegistrationForm(registrationData, REGISTRATION_STEPS.length)
      if (!validation.isValid) {
        setErrors(validation.errors)
        throw new Error('Please fix validation errors')
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Move to completion step
      setCurrentStep(REGISTRATION_STEPS.length - 1)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }, [registrationData])

  // Reset form
  const resetForm = useCallback(() => {
    setCurrentStep(0)
    setRegistrationData(DEFAULT_REGISTRATION_FORM)
    setErrors({})
    setError(null)
  }, [])

  return {
    currentStep,
    formData,
    steps,
    isLoading,
    error,
    actions: {
      nextStep,
      prevStep,
      updateData,
      validateStep,
      submitRegistration,
      resetForm
    }
  }
}
