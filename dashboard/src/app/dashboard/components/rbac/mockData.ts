import { Permission, Role, UserRoleAssignment, AuditLog } from './types'

export const mockPermissions: Permission[] = [
  // Dashboard Permissions
  { id: 'dashboard_view', name: 'View Dashboard', description: 'Access to main dashboard', category: 'Dashboard', isActive: true },
  { id: 'dashboard_widgets', name: 'Manage Widgets', description: 'Customize dashboard widgets', category: 'Dashboard', isActive: true },
  
  // Employee Management Permissions
  { id: 'employee_view', name: 'View Employees', description: 'View employee list and profiles', category: 'Employee Management', isActive: true },
  { id: 'employee_create', name: 'Create Employee', description: 'Add new employees to the system', category: 'Employee Management', isActive: true },
  { id: 'employee_edit', name: 'Edit Employee', description: 'Modify employee information', category: 'Employee Management', isActive: true },
  { id: 'employee_delete', name: 'Delete Employee', description: 'Remove employees from the system', category: 'Employee Management', isActive: true },
  { id: 'employee_export', name: 'Export Employee Data', description: 'Export employee information', category: 'Employee Management', isActive: true },
  
  // Project Management Permissions
  { id: 'project_view', name: 'View Projects', description: 'Access project list and details', category: 'Project Management', isActive: true },
  { id: 'project_create', name: 'Create Project', description: 'Create new projects', category: 'Project Management', isActive: true },
  { id: 'project_edit', name: 'Edit Project', description: 'Modify project details', category: 'Project Management', isActive: true },
  { id: 'project_delete', name: 'Delete Project', description: 'Remove projects', category: 'Project Management', isActive: true },
  { id: 'project_assign', name: 'Assign Team Members', description: 'Assign/remove team members from projects', category: 'Project Management', isActive: true },
  { id: 'project_budget', name: 'Manage Budget', description: 'View and modify project budgets', category: 'Project Management', isActive: true },
  
  // Task Management Permissions
  { id: 'task_view', name: 'View Tasks', description: 'Access task lists and details', category: 'Task Management', isActive: true },
  { id: 'task_create', name: 'Create Task', description: 'Create new tasks', category: 'Task Management', isActive: true },
  { id: 'task_edit', name: 'Edit Task', description: 'Modify task details', category: 'Task Management', isActive: true },
  { id: 'task_delete', name: 'Delete Task', description: 'Remove tasks', category: 'Task Management', isActive: true },
  { id: 'task_assign', name: 'Assign Tasks', description: 'Assign tasks to team members', category: 'Task Management', isActive: true },
  { id: 'task_status', name: 'Change Task Status', description: 'Update task status and progress', category: 'Task Management', isActive: true },
  
  // Team Management Permissions
  { id: 'team_view', name: 'View Teams', description: 'Access team information', category: 'Team Management', isActive: true },
  { id: 'team_create', name: 'Create Team', description: 'Create new teams', category: 'Team Management', isActive: true },
  { id: 'team_edit', name: 'Edit Team', description: 'Modify team details', category: 'Team Management', isActive: true },
  { id: 'team_delete', name: 'Delete Team', description: 'Remove teams', category: 'Team Management', isActive: true },
  { id: 'team_members', name: 'Manage Team Members', description: 'Add/remove team members', category: 'Team Management', isActive: true },
  
  // Attendance Management Permissions
  { id: 'attendance_view', name: 'View Attendance', description: 'Access attendance records', category: 'Attendance Management', isActive: true },
  { id: 'attendance_edit', name: 'Edit Attendance', description: 'Modify attendance records', category: 'Attendance Management', isActive: true },
  { id: 'attendance_reports', name: 'Generate Attendance Reports', description: 'Create attendance reports', category: 'Attendance Management', isActive: true },
  { id: 'attendance_approve', name: 'Approve Time Off', description: 'Approve leave and time-off requests', category: 'Attendance Management', isActive: true },
  
  // Payroll Management Permissions
  { id: 'payroll_view', name: 'View Payroll', description: 'Access payroll information', category: 'Payroll Management', isActive: true },
  { id: 'payroll_process', name: 'Process Payroll', description: 'Run payroll calculations', category: 'Payroll Management', isActive: true },
  { id: 'payroll_edit', name: 'Edit Payroll', description: 'Modify payroll records', category: 'Payroll Management', isActive: true },
  { id: 'payroll_reports', name: 'Generate Payroll Reports', description: 'Create payroll reports', category: 'Payroll Management', isActive: true },
  { id: 'salary_view', name: 'View Salaries', description: 'Access salary information', category: 'Payroll Management', isActive: true },
  { id: 'salary_edit', name: 'Edit Salaries', description: 'Modify employee salaries', category: 'Payroll Management', isActive: true },
  
  // Performance Management Permissions
  { id: 'performance_view', name: 'View Performance', description: 'Access performance data', category: 'Performance Management', isActive: true },
  { id: 'performance_review', name: 'Conduct Reviews', description: 'Create and manage performance reviews', category: 'Performance Management', isActive: true },
  { id: 'performance_goals', name: 'Manage Goals', description: 'Set and track employee goals', category: 'Performance Management', isActive: true },
  { id: 'performance_reports', name: 'Generate Performance Reports', description: 'Create performance reports', category: 'Performance Management', isActive: true },
  
  // Analytics & Reports Permissions
  { id: 'analytics_view', name: 'View Analytics', description: 'Access analytics dashboard', category: 'Analytics & Reports', isActive: true },
  { id: 'analytics_export', name: 'Export Analytics', description: 'Export analytics data', category: 'Analytics & Reports', isActive: true },
  { id: 'reports_create', name: 'Create Reports', description: 'Generate custom reports', category: 'Analytics & Reports', isActive: true },
  { id: 'reports_schedule', name: 'Schedule Reports', description: 'Set up automated reports', category: 'Analytics & Reports', isActive: true },
  
  // Settings & Configuration Permissions
  { id: 'settings_view', name: 'View Settings', description: 'Access system settings', category: 'Settings & Configuration', isActive: true },
  { id: 'settings_edit', name: 'Edit Settings', description: 'Modify system configurations', category: 'Settings & Configuration', isActive: true },
  { id: 'users_manage', name: 'Manage Users', description: 'Create and manage user accounts', category: 'Settings & Configuration', isActive: true },
  { id: 'roles_manage', name: 'Manage Roles', description: 'Create and manage user roles', category: 'Settings & Configuration', isActive: true },
  { id: 'permissions_manage', name: 'Manage Permissions', description: 'Configure system permissions', category: 'Settings & Configuration', isActive: true }
]

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: mockPermissions.map(p => p.id),
    isActive: true,
    userCount: 2,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    createdBy: 'System'
  },
  {
    id: '2', 
    name: 'HR Manager',
    description: 'Human resources management with employee and payroll access',
    permissions: [
      'dashboard_view', 'employee_view', 'employee_create', 'employee_edit', 'employee_export',
      'attendance_view', 'attendance_edit', 'attendance_reports', 'attendance_approve',
      'payroll_view', 'payroll_process', 'payroll_edit', 'payroll_reports', 'salary_view', 'salary_edit',
      'performance_view', 'performance_review', 'performance_goals', 'performance_reports',
      'analytics_view', 'reports_create'
    ],
    isActive: true,
    userCount: 3,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
    createdBy: 'Admin'
  },
  {
    id: '3',
    name: 'Project Manager', 
    description: 'Project and team management with limited administrative access',
    permissions: [
      'dashboard_view', 'employee_view',
      'project_view', 'project_create', 'project_edit', 'project_assign', 'project_budget',
      'task_view', 'task_create', 'task_edit', 'task_assign', 'task_status',
      'team_view', 'team_edit', 'team_members',
      'attendance_view', 'performance_view', 'analytics_view', 'reports_create'
    ],
    isActive: true,
    userCount: 8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-12',
    createdBy: 'Admin'
  },
  {
    id: '4',
    name: 'Team Lead',
    description: 'Team leadership with task and member management',
    permissions: [
      'dashboard_view', 'employee_view',
      'project_view', 'task_view', 'task_create', 'task_edit', 'task_assign', 'task_status',
      'team_view', 'team_members', 'attendance_view', 'performance_view', 'analytics_view'
    ],
    isActive: true,
    userCount: 12,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-08',
    createdBy: 'Admin'
  },
  {
    id: '5',
    name: 'Employee',
    description: 'Basic employee access with limited permissions',
    permissions: [
      'dashboard_view', 'task_view', 'task_edit', 'task_status',
      'attendance_view', 'performance_view'
    ],
    isActive: true,
    userCount: 45,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-05',
    createdBy: 'Admin'
  },
  {
    id: '6',
    name: 'Finance Manager',
    description: 'Financial operations with payroll and budget access',
    permissions: [
      'dashboard_view', 'employee_view',
      'project_view', 'project_budget',
      'payroll_view', 'payroll_process', 'payroll_edit', 'payroll_reports', 'salary_view', 'salary_edit',
      'analytics_view', 'analytics_export', 'reports_create'
    ],
    isActive: true,
    userCount: 2,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-14',
    createdBy: 'Admin'
  }
]

export const mockUserRoleAssignments: UserRoleAssignment[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'John Admin',
    userEmail: 'john.admin@company.com',
    roleId: '1',
    roleName: 'Super Admin',
    assignedAt: '2024-01-01',
    assignedBy: 'System',
    isActive: true
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'Sarah HR',
    userEmail: 'sarah.hr@company.com',
    roleId: '2',
    roleName: 'HR Manager',
    assignedAt: '2024-01-02',
    assignedBy: 'John Admin',
    isActive: true
  },
  {
    id: '3',
    userId: 'u3',
    userName: 'Mike Project',
    userEmail: 'mike.project@company.com',
    roleId: '3',
    roleName: 'Project Manager',
    assignedAt: '2024-01-03',
    assignedBy: 'John Admin',
    isActive: true
  },
  {
    id: '4',
    userId: 'u4',
    userName: 'Emily Finance',
    userEmail: 'emily.finance@company.com',
    roleId: '6',
    roleName: 'Finance Manager',
    assignedAt: '2024-01-04',
    assignedBy: 'John Admin',
    isActive: true
  },
  {
    id: '5',
    userId: 'u5',
    userName: 'David Lead',
    userEmail: 'david.lead@company.com',
    roleId: '4',
    roleName: 'Team Lead',
    assignedAt: '2024-01-05',
    assignedBy: 'Mike Project',
    isActive: true
  }
]

export const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'CREATE_ROLE',
    targetType: 'ROLE',
    targetId: '6',
    targetName: 'Finance Manager',
    performedBy: 'John Admin',
    performedAt: '2024-01-15T10:30:00Z',
    details: 'Created new Finance Manager role with payroll permissions'
  },
  {
    id: '2',
    action: 'ASSIGN_ROLE',
    targetType: 'USER',
    targetId: 'u4',
    targetName: 'Emily Finance',
    performedBy: 'John Admin',
    performedAt: '2024-01-15T11:00:00Z',
    details: 'Assigned Finance Manager role to Emily Finance'
  },
  {
    id: '3',
    action: 'UPDATE_PERMISSIONS',
    targetType: 'ROLE',
    targetId: '3',
    targetName: 'Project Manager',
    performedBy: 'John Admin',
    performedAt: '2024-01-14T14:20:00Z',
    details: 'Added project budget permission to Project Manager role',
    oldValue: 'Without budget permission',
    newValue: 'With budget permission'
  },
  {
    id: '4',
    action: 'UPDATE_ROLE',
    targetType: 'ROLE',
    targetId: '2',
    targetName: 'HR Manager',
    performedBy: 'John Admin',
    performedAt: '2024-01-13T09:15:00Z',
    details: 'Updated HR Manager role description and permissions'
  },
  {
    id: '5',
    action: 'REVOKE_ROLE',
    targetType: 'USER',
    targetId: 'u6',
    targetName: 'Former Employee',
    performedBy: 'Sarah HR',
    performedAt: '2024-01-12T16:45:00Z',
    details: 'Revoked Employee role from terminated user'
  }
]