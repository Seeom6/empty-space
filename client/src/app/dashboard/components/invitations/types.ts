export interface InviteCode {
  id: string
  code: string
  department: string
  role: string
  permissions: string[]
  status: 'active' | 'used' | 'expired' | 'revoked'
  usedBy?: string
  usedByEmail?: string
  createdAt: string
  createdBy: string
  expiresAt: string
  usedAt?: string
}

export interface RegistrationData {
  inviteCode: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegistrationStep {
  id: number
  title: string
  description: string
  completed: boolean
}

export type InviteStatus = 'active' | 'used' | 'expired' | 'revoked'
export type RegistrationStepType = 'invite-code' | 'personal-info' | 'password' | 'complete'