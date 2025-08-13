export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: 'Male' | 'Female' | 'Other'
  birthDate: string
  address: string
  position: string
  department: string
  jobTitle: string
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract'
  status: 'Active' | 'Inactive' | 'Terminated'
  hireDate: string
  manager?: string
  managerId?: string
  technologies: string[]
  avatar?: string
  salary: {
    base: number
    bonuses: number
    deductions: number
    net: number
  }
  attendance: {
    present: number
    late: number
    absent: number
  }
  performance: {
    rating: number
    goals: string[]
    feedback: string[]
  }
  projects: string[]
  teams: string[]
}

export interface EmployeeFilters {
  department: string
  status: string
  employmentType: string
  jobTitle: string
  manager: string
  search: string
}

export const departments = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Customer Support'
]

export const jobTitles = [
  'Software Engineer',
  'Senior Software Engineer',
  'Tech Lead',
  'Engineering Manager',
  'Product Manager',
  'UX Designer',
  'UI Designer',
  'Marketing Specialist',
  'Sales Representative',
  'HR Specialist',
  'Finance Analyst',
  'Operations Manager'
]

export const technologies = [
  'React',
  'Node.js',
  'Python',
  'JavaScript',
  'TypeScript',
  'AWS',
  'Docker',
  'Kubernetes',
  'MongoDB',
  'PostgreSQL',
  'Redis',
  'GraphQL',
  'REST API',
  'Figma',
  'Adobe Creative Suite',
  'Salesforce',
  'HubSpot'
]