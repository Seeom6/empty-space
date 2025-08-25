import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Mail, User, Lock, AlertCircle } from 'lucide-react'
import { mockInviteCodes } from './mockData'
import { RegistrationData, RegistrationStep, RegistrationStepType } from './types'

export function EmployeeRegistration() {
  const [currentStep, setCurrentStep] = useState(0)
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    inviteCode: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Partial<RegistrationData>>({})
  const [isValidCode, setIsValidCode] = useState(false)
  const [inviteDetails, setInviteDetails] = useState<any>(null)

  const steps: RegistrationStep[] = [
    {
      id: 1,
      title: 'Enter Invite Code',
      description: 'Provide the invitation code you received',
      completed: currentStep > 0
    },
    {
      id: 2,
      title: 'Personal Information',
      description: 'Enter your basic details',
      completed: currentStep > 1
    },
    {
      id: 3,
      title: 'Set Password',
      description: 'Create a secure password',
      completed: currentStep > 2
    },
    {
      id: 4,
      title: 'Complete',
      description: 'Registration successful',
      completed: currentStep > 3
    }
  ]

  const validateInviteCode = (code: string) => {
    const invite = mockInviteCodes.find(inv => inv.code === code && inv.status === 'active')
    if (invite) {
      setIsValidCode(true)
      setInviteDetails(invite)
      setErrors(prev => ({ ...prev, inviteCode: undefined }))
      return true
    } else {
      setIsValidCode(false)
      setInviteDetails(null)
      setErrors(prev => ({ ...prev, inviteCode: 'Invalid or expired invite code' }))
      return false
    }
  }

  const validatePersonalInfo = () => {
    const newErrors: Partial<RegistrationData> = {}
    
    if (!registrationData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!registrationData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!registrationData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(registrationData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors: Partial<RegistrationData> = {}
    
    if (!registrationData.password) {
      newErrors.password = 'Password is required'
    } else if (registrationData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (registrationData.password !== registrationData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    let isValid = false
    
    switch (currentStep) {
      case 0:
        isValid = validateInviteCode(registrationData.inviteCode)
        break
      case 1:
        isValid = validatePersonalInfo()
        break
      case 2:
        isValid = validatePassword()
        if (isValid) {
          // Mock registration completion
          setTimeout(() => {
            setCurrentStep(3)
          }, 1000)
        }
        break
      default:
        isValid = true
    }
    
    if (isValid && currentStep < 2) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Join Our Team</h1>
          <p className="text-muted-foreground mt-2">
            Complete your registration to get started
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center
                    ${step.completed ? 'bg-primary border-primary text-primary-foreground' : 
                      currentStep === index ? 'border-primary text-primary' : 
                      'border-muted-foreground text-muted-foreground'}
                  `}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-px mx-4
                    ${step.completed ? 'bg-primary' : 'bg-muted-foreground/30'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Registration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 0 && <Mail className="h-5 w-5" />}
              {currentStep === 1 && <User className="h-5 w-5" />}
              {currentStep === 2 && <Lock className="h-5 w-5" />}
              {currentStep === 3 && <CheckCircle className="h-5 w-5 text-green-500" />}
              {steps[currentStep]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Invite Code */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invitation Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="Enter your invite code (e.g., INV-2024-ABC123)"
                    value={registrationData.inviteCode}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, inviteCode: e.target.value }))}
                    className={errors.inviteCode ? 'border-destructive' : ''}
                  />
                  {errors.inviteCode && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.inviteCode}</AlertDescription>
                    </Alert>
                  )}
                </div>
                
                {isValidCode && inviteDetails && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div>Valid invite code! You'll be joining:</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{inviteDetails.department}</Badge>
                          <span>as</span>
                          <Badge>{inviteDetails.role}</Badge>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={registrationData.firstName}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={errors.firstName ? 'border-destructive' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={registrationData.lastName}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={errors.lastName ? 'border-destructive' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@company.com"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a secure password"
                    value={registrationData.password}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                    className={errors.password ? 'border-destructive' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={registrationData.confirmPassword}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 3 && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Registration Complete!</h3>
                  <p className="text-muted-foreground mt-1">
                    Welcome to the team! Your account has been created successfully.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm space-y-1">
                    <div>Name: <span className="font-medium">{registrationData.firstName} {registrationData.lastName}</span></div>
                    <div>Email: <span className="font-medium">{registrationData.email}</span></div>
                    <div>Department: <span className="font-medium">{inviteDetails?.department}</span></div>
                    <div>Role: <span className="font-medium">{inviteDetails?.role}</span></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  You will be redirected to the login page in a few seconds...
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 3 && (
              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  Back
                </Button>
                <Button onClick={handleNext}>
                  {currentStep === 2 ? 'Create Account' : 'Continue'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}