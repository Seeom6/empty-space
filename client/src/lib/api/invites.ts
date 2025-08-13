import { InviteCode } from '@/app/dashboard/components/invitations/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Transform backend invite data to frontend format
const transformInviteData = (backendInvite: any): InviteCode => ({
  id: backendInvite.id,
  code: backendInvite.code,
  department: backendInvite.department_name,
  role: backendInvite.role,
  permissions: Object.keys(backendInvite.permissions || {}),
  status: backendInvite.status,
  usedBy: backendInvite.used_by_email ? backendInvite.used_by_email.split('@')[0] : undefined,
  usedByEmail: backendInvite.used_by_email,
  createdAt: new Date(backendInvite.created_at).toISOString(),
  createdBy: backendInvite.created_by_name,
  expiresAt: new Date(backendInvite.expires_at).toISOString(),
  usedAt: backendInvite.used_at ? new Date(backendInvite.used_at).toISOString() : undefined
})

export const inviteApi = {
  // Get all invites with filtering
  async getInvites(params: {
    search?: string
    status?: string
    department_id?: string
    page?: number
    limit?: number
  } = {}) {
    const searchParams = new URLSearchParams()
    
    if (params.search) searchParams.append('search', params.search)
    if (params.status && params.status !== 'all') searchParams.append('status', params.status)
    if (params.department_id && params.department_id !== 'all') searchParams.append('department_id', params.department_id)
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())

    const response = await fetch(`${API_BASE_URL}/admin/invites?${searchParams}`, {
      headers: getAuthHeaders()
    })

    const data = await handleResponse(response)
    
    return {
      ...data.data,
      invites: data.data.invites.map(transformInviteData)
    }
  },

  // Create new invite
  async createInvite(inviteData: {
    department_id: string
    department_name: string
    role: string
    permissions: Record<string, any>
    expires_at?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/admin/invites`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(inviteData)
    })

    const data = await handleResponse(response)
    
    return {
      ...data,
      data: transformInviteData(data.data)
    }
  },

  // Revoke invite
  async revokeInvite(code: string) {
    const response = await fetch(`${API_BASE_URL}/admin/invites/${code}/revoke`, {
      method: 'PUT',
      headers: getAuthHeaders()
    })

    return handleResponse(response)
  },

  // Get invite statistics
  async getInviteStats() {
    const response = await fetch(`${API_BASE_URL}/admin/invites/stats`, {
      headers: getAuthHeaders()
    })

    return handleResponse(response)
  }
}

export const departmentApi = {
  // Get active departments for dropdowns
  async getActiveDepartments() {
    const response = await fetch(`${API_BASE_URL}/admin/departments/active`, {
      headers: getAuthHeaders()
    })

    return handleResponse(response)
  },

  // Get all departments with filtering
  async getDepartments(params: {
    search?: string
    status?: string
    page?: number
    limit?: number
  } = {}) {
    const searchParams = new URLSearchParams()
    
    if (params.search) searchParams.append('search', params.search)
    if (params.status && params.status !== 'all') searchParams.append('status', params.status)
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())

    const response = await fetch(`${API_BASE_URL}/admin/departments?${searchParams}`, {
      headers: getAuthHeaders()
    })

    return handleResponse(response)
  },

  // Create new department
  async createDepartment(departmentData: {
    name: string
    description?: string
    manager_id?: string
    manager_name?: string
    location?: string
    budget?: string
    is_active?: boolean
  }) {
    const response = await fetch(`${API_BASE_URL}/admin/departments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(departmentData)
    })

    return handleResponse(response)
  }
}

export const authApi = {
  // Step 1: Verify invite code
  async verifyInviteCode(invite_code: string) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-invite-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code })
    })

    return handleResponse(response)
  },

  // Step 2: Start registration
  async startRegistration(data: {
    invite_code: string
    first_name: string
    last_name: string
    email: string
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/start-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    return handleResponse(response)
  },

  // Step 3: Verify OTP
  async verifyOtp(otp: string) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp })
    })

    return handleResponse(response)
  },

  // Step 4: Set password and complete registration
  async setPassword(data: {
    password: string
    confirm_password: string
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    return handleResponse(response)
  },

  // Login
  async login(data: {
    email: string
    password: string
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    return handleResponse(response)
  }
}
