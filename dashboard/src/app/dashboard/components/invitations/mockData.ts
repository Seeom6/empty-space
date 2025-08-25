import { InviteCode } from './types'

export const mockInviteCodes: InviteCode[] = [
  {
    id: '1',
    code: 'INV-2024-ABC123',
    department: 'Engineering',
    role: 'Frontend Developer',
    permissions: ['project_view', 'task_view', 'task_edit', 'dashboard_view'],
    status: 'used',
    usedBy: 'John Smith',
    usedByEmail: 'john.smith@company.com',
    createdAt: '2024-01-15',
    createdBy: 'Admin',
    expiresAt: '2024-02-15',
    usedAt: '2024-01-18'
  },
  {
    id: '2',
    code: 'INV-2024-DEF456',
    department: 'Marketing',
    role: 'Marketing Specialist',
    permissions: ['dashboard_view', 'project_view', 'analytics_view'],
    status: 'active',
    createdAt: '2024-01-20',
    createdBy: 'HR Manager',
    expiresAt: '2024-02-20'
  },
  {
    id: '3',
    code: 'INV-2024-GHI789',
    department: 'Sales',
    role: 'Sales Representative',
    permissions: ['dashboard_view', 'project_view'],
    status: 'expired',
    createdAt: '2023-12-01',
    createdBy: 'Admin',
    expiresAt: '2024-01-01'
  },
  {
    id: '4',
    code: 'INV-2024-JKL012',
    department: 'Engineering',
    role: 'Backend Developer',
    permissions: ['project_view', 'task_view', 'task_create', 'task_edit', 'dashboard_view'],
    status: 'active',
    createdAt: '2024-01-22',
    createdBy: 'Admin',
    expiresAt: '2024-02-22'
  },
  {
    id: '5',
    code: 'INV-2024-MNO345',
    department: 'HR',
    role: 'HR Coordinator',
    permissions: ['dashboard_view', 'employee_view', 'attendance_view'],
    status: 'revoked',
    createdAt: '2024-01-10',
    createdBy: 'HR Manager',
    expiresAt: '2024-02-10'
  },
  {
    id: '6',
    code: 'INV-2024-PQR678',
    department: 'Finance',
    role: 'Financial Analyst',
    permissions: ['dashboard_view', 'payroll_view', 'analytics_view'],
    status: 'used',
    usedBy: 'Sarah Johnson',
    usedByEmail: 'sarah.johnson@company.com',
    createdAt: '2024-01-12',
    createdBy: 'Admin',
    expiresAt: '2024-02-12',
    usedAt: '2024-01-14'
  }
]

export const departments = [
  'Engineering',
  'Marketing', 
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Design',
  'Product'
]

export const roles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Marketing Specialist',
  'Sales Representative',
  'HR Coordinator',
  'Financial Analyst',
  'Operations Manager'
]