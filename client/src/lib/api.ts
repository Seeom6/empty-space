import axios from 'axios'
import { toast } from 'react-hot-toast'

// Create axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || 'An error occurred'
    
    // Handle specific error codes
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/auth/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Auth API endpoints - Following the exact authentication flow
export const authApi = {
  // Login endpoint
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  // Step 1: Verify invite code
  verifyInviteCode: (invite_code: string) =>
    api.post('/auth/verify-invite-code', { invite_code }),

  // Step 2: Start registration with basic info
  startRegistration: (data: {
    invite_code: string
    first_name: string
    last_name: string
    email: string
  }) => api.post('/auth/start-registration', data),

  // Step 3: Verify OTP
  verifyOTP: (otp: string) =>
    api.post('/auth/verify-otp', { otp }),

  // Step 4: Set password and complete registration
  setPassword: (data: {
    password: string
    confirm_password: string
  }) => api.post('/auth/set-password', data),

  // Additional auth endpoints
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  refreshToken: () =>
    api.post('/auth/refresh'),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),

  // Legacy register endpoint (for backward compatibility)
  register: (data: {
    inviteCode: string
    firstName: string
    lastName: string
    email: string
    password: string
  }) => api.post('/auth/register', data),
}

// Users API endpoints
export const usersApi = {
  getUsers: (params?: any) =>
    api.get('/users', { params }),
  
  getUser: (id: string) =>
    api.get(`/users/${id}`),
  
  createUser: (data: any) =>
    api.post('/users', data),
  
  updateUser: (id: string, data: any) =>
    api.put(`/users/${id}`, data),
  
  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
  
  assignTechnology: (userId: string, technologyId: string) =>
    api.post(`/users/${userId}/technologies`, { technologyId }),
  
  removeTechnology: (userId: string, technologyId: string) =>
    api.delete(`/users/${userId}/technologies/${technologyId}`),
}

// Projects API endpoints
export const projectsApi = {
  getProjects: (params?: any) =>
    api.get('/projects', { params }),
  
  getProject: (id: string) =>
    api.get(`/projects/${id}`),
  
  createProject: (data: any) =>
    api.post('/projects', data),
  
  updateProject: (id: string, data: any) =>
    api.put(`/projects/${id}`, data),
  
  deleteProject: (id: string) =>
    api.delete(`/projects/${id}`),
  
  addMember: (projectId: string, data: { userId: string; role: string }) =>
    api.post(`/projects/${projectId}/members`, data),
  
  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
}

// Tasks API endpoints
export const tasksApi = {
  getTasks: (params?: any) =>
    api.get('/tasks', { params }),
  
  getTask: (id: string) =>
    api.get(`/tasks/${id}`),
  
  createTask: (data: any) =>
    api.post('/tasks', data),
  
  updateTask: (id: string, data: any) =>
    api.put(`/tasks/${id}`, data),
  
  deleteTask: (id: string) =>
    api.delete(`/tasks/${id}`),
  
  restoreTask: (id: string) =>
    api.post(`/tasks/${id}/restore`),
  
  addWatcher: (taskId: string, userId: string) =>
    api.post(`/tasks/${taskId}/watchers`, { userId }),
  
  removeWatcher: (taskId: string, userId: string) =>
    api.delete(`/tasks/${taskId}/watchers/${userId}`),
}

// Teams API endpoints
export const teamsApi = {
  getTeams: (params?: any) =>
    api.get('/teams', { params }),
  
  getTeam: (id: string) =>
    api.get(`/teams/${id}`),
  
  createTeam: (data: any) =>
    api.post('/teams', data),
  
  updateTeam: (id: string, data: any) =>
    api.put(`/teams/${id}`, data),
  
  deleteTeam: (id: string) =>
    api.delete(`/teams/${id}`),
  
  addMember: (teamId: string, data: { userId: string; role: string }) =>
    api.post(`/teams/${teamId}/members`, data),
  
  removeMember: (teamId: string, userId: string) =>
    api.delete(`/teams/${teamId}/members/${userId}`),
}

// Technologies API endpoints
export const technologiesApi = {
  getTechnologies: (params?: any) =>
    api.get('/technologies', { params }),
  
  getTechnology: (id: string) =>
    api.get(`/technologies/${id}`),
  
  createTechnology: (data: any) =>
    api.post('/technologies', data),
  
  updateTechnology: (id: string, data: any) =>
    api.put(`/technologies/${id}`, data),
  
  deleteTechnology: (id: string) =>
    api.delete(`/technologies/${id}`),
}

// Attendance API endpoints
export const attendanceApi = {
  getAttendance: (params?: any) =>
    api.get('/attendance', { params }),
  
  checkIn: () =>
    api.post('/attendance/check-in'),
  
  checkOut: () =>
    api.post('/attendance/check-out'),
  
  getMyAttendance: (params?: any) =>
    api.get('/attendance/me', { params }),
  
  updateAttendance: (id: string, data: any) =>
    api.put(`/attendance/${id}`, data),
}

// Payroll API endpoints
export const payrollApi = {
  getPayroll: (params?: any) =>
    api.get('/payroll', { params }),
  
  getPayrollEntry: (id: string) =>
    api.get(`/payroll/${id}`),
  
  createPayrollEntry: (data: any) =>
    api.post('/payroll', data),
  
  updatePayrollEntry: (id: string, data: any) =>
    api.put(`/payroll/${id}`, data),
  
  deletePayrollEntry: (id: string) =>
    api.delete(`/payroll/${id}`),
  
  generatePayslip: (id: string) =>
    api.get(`/payroll/${id}/payslip`, { responseType: 'blob' }),
}

// Performance API endpoints
export const performanceApi = {
  getReviews: (params?: any) =>
    api.get('/performance', { params }),
  
  getReview: (id: string) =>
    api.get(`/performance/${id}`),
  
  createReview: (data: any) =>
    api.post('/performance', data),
  
  updateReview: (id: string, data: any) =>
    api.put(`/performance/${id}`, data),
  
  deleteReview: (id: string) =>
    api.delete(`/performance/${id}`),
  
  getGoals: (userId: string) =>
    api.get(`/performance/goals/${userId}`),
  
  updateGoal: (goalId: string, data: any) =>
    api.put(`/performance/goals/${goalId}`, data),
}

// Invites API endpoints
export const invitesApi = {
  getInvites: (params?: any) =>
    api.get('/invites', { params }),
  
  createInvite: (data: any) =>
    api.post('/invites', data),
  
  revokeInvite: (id: string) =>
    api.delete(`/invites/${id}`),
}

// Roles and Permissions API endpoints
export const rolesApi = {
  getRoles: () =>
    api.get('/roles'),
  
  getRole: (id: string) =>
    api.get(`/roles/${id}`),
  
  createRole: (data: any) =>
    api.post('/roles', data),
  
  updateRole: (id: string, data: any) =>
    api.put(`/roles/${id}`, data),
  
  deleteRole: (id: string) =>
    api.delete(`/roles/${id}`),
  
  getPermissions: () =>
    api.get('/permissions'),
  
  assignRole: (userId: string, roleId: string) =>
    api.post(`/users/${userId}/roles`, { roleId }),
  
  revokeRole: (userId: string, roleId: string) =>
    api.delete(`/users/${userId}/roles/${roleId}`),
}

// Analytics API endpoints
export const analyticsApi = {
  getDashboardStats: () =>
    api.get('/analytics/dashboard'),
  
  getProjectAnalytics: (params?: any) =>
    api.get('/analytics/projects', { params }),
  
  getTaskAnalytics: (params?: any) =>
    api.get('/analytics/tasks', { params }),
  
  getEmployeeAnalytics: (params?: any) =>
    api.get('/analytics/employees', { params }),
  
  getAttendanceAnalytics: (params?: any) =>
    api.get('/analytics/attendance', { params }),
  
  getPayrollAnalytics: (params?: any) =>
    api.get('/analytics/payroll', { params }),
  
  generateReport: (type: string, params?: any) =>
    api.post('/analytics/reports', { type, ...params }),
  
  getReports: () =>
    api.get('/analytics/reports'),
  
  downloadReport: (id: string) =>
    api.get(`/analytics/reports/${id}/download`, { responseType: 'blob' }),
}
