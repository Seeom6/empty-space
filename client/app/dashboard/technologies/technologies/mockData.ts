import { Technology, TechnologyAssignment, TechnologyCategory } from './types'

export const mockTechnologies: Technology[] = [
  {
    id: '1',
    name: 'React',
    category: 'Frontend',
    description: 'A JavaScript library for building user interfaces',
    status: 'active',
    version: '18.2.0',
    icon: '⚛️',
    documentationUrl: 'https://react.dev',
    userCount: 12,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    createdBy: 'Admin'
  },
  {
    id: '2',
    name: 'Node.js',
    category: 'Backend',
    description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
    status: 'active',
    version: '20.10.0',
    icon: '🟢',
    documentationUrl: 'https://nodejs.org',
    userCount: 8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
    createdBy: 'Admin'
  },
  {
    id: '3',
    name: 'PostgreSQL',
    category: 'Database',
    description: 'Advanced open source relational database',
    status: 'active',
    version: '16.1',
    icon: '🐘',
    documentationUrl: 'https://postgresql.org',
    userCount: 6,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-12',
    createdBy: 'Admin'
  },
  {
    id: '4',
    name: 'Docker',
    category: 'DevOps',
    description: 'Platform for developing, shipping, and running applications',
    status: 'active',
    version: '24.0.7',
    icon: '🐳',
    documentationUrl: 'https://docker.com',
    userCount: 10,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-18',
    createdBy: 'Admin'
  },
  {
    id: '5',
    name: 'React Native',
    category: 'Mobile',
    description: 'Framework for building native mobile applications',
    status: 'active',
    version: '0.73.2',
    icon: '📱',
    documentationUrl: 'https://reactnative.dev',
    userCount: 5,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-20',
    createdBy: 'Admin'
  },
  {
    id: '6',
    name: 'Figma',
    category: 'Design',
    description: 'Collaborative interface design tool',
    status: 'active',
    version: 'Web App',
    icon: '🎨',
    documentationUrl: 'https://figma.com',
    userCount: 4,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-14',
    createdBy: 'Admin'
  },
  {
    id: '7',
    name: 'Jest',
    category: 'Testing',
    description: 'JavaScript testing framework',
    status: 'active',
    version: '29.7.0',
    icon: '🃏',
    documentationUrl: 'https://jestjs.io',
    userCount: 8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-16',
    createdBy: 'Admin'
  },
  {
    id: '8',
    name: 'Google Analytics',
    category: 'Analytics',
    description: 'Web analytics service',
    status: 'active',
    version: 'GA4',
    icon: '📊',
    documentationUrl: 'https://analytics.google.com',
    userCount: 3,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-08',
    createdBy: 'Admin'
  },
  {
    id: '9',
    name: 'Angular',
    category: 'Frontend',
    description: 'Platform for building mobile and desktop web applications',
    status: 'inactive',
    version: '17.0.8',
    icon: '🅰️',
    documentationUrl: 'https://angular.io',
    userCount: 2,
    createdAt: '2023-12-01',
    updatedAt: '2024-01-05',
    createdBy: 'Admin'
  },
  {
    id: '10',
    name: 'jQuery',
    category: 'Frontend',
    description: 'Fast, small, and feature-rich JavaScript library',
    status: 'deprecated',
    version: '3.7.1',
    icon: '💙',
    documentationUrl: 'https://jquery.com',
    userCount: 1,
    createdAt: '2023-01-01',
    updatedAt: '2023-12-01',
    createdBy: 'Admin'
  }
]

export const mockTechnologyAssignments: TechnologyAssignment[] = [
  {
    id: '1',
    technologyId: '1',
    userId: 'u1',
    userName: 'John Smith',
    userPosition: 'Frontend Developer',
    assignedAt: '2024-01-15',
    assignedBy: 'Admin',
    isActive: true
  },
  {
    id: '2',
    technologyId: '1',
    userId: 'u2',
    userName: 'Sarah Johnson',
    userPosition: 'Full Stack Developer',
    assignedAt: '2024-01-16',
    assignedBy: 'Admin',
    isActive: true
  },
  {
    id: '3',
    technologyId: '2',
    userId: 'u2',
    userName: 'Sarah Johnson',
    userPosition: 'Full Stack Developer',
    assignedAt: '2024-01-16',
    assignedBy: 'Admin',
    isActive: true
  },
  {
    id: '4',
    technologyId: '3',
    userId: 'u3',
    userName: 'Mike Wilson',
    userPosition: 'Backend Developer',
    assignedAt: '2024-01-17',
    assignedBy: 'Admin',
    isActive: true
  },
  {
    id: '5',
    technologyId: '4',
    userId: 'u4',
    userName: 'Emily Brown',
    userPosition: 'DevOps Engineer',
    assignedAt: '2024-01-18',
    assignedBy: 'Admin',
    isActive: true
  },
  {
    id: '6',
    technologyId: '6',
    userId: 'u5',
    userName: 'David Lee',
    userPosition: 'UI/UX Designer',
    assignedAt: '2024-01-19',
    assignedBy: 'Admin',
    isActive: true
  }
]

export const technologyCategories: TechnologyCategory[] = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Mobile',
  'Design',
  'Testing',
  'Analytics'
]

export const employees = [
  { id: 'u1', name: 'John Smith', position: 'Frontend Developer', email: 'john.smith@company.com' },
  { id: 'u2', name: 'Sarah Johnson', position: 'Full Stack Developer', email: 'sarah.johnson@company.com' },
  { id: 'u3', name: 'Mike Wilson', position: 'Backend Developer', email: 'mike.wilson@company.com' },
  { id: 'u4', name: 'Emily Brown', position: 'DevOps Engineer', email: 'emily.brown@company.com' },
  { id: 'u5', name: 'David Lee', position: 'UI/UX Designer', email: 'david.lee@company.com' },
  { id: 'u6', name: 'Lisa Chen', position: 'QA Engineer', email: 'lisa.chen@company.com' },
  { id: 'u7', name: 'Alex Rodriguez', position: 'Mobile Developer', email: 'alex.rodriguez@company.com' },
  { id: 'u8', name: 'Jessica Taylor', position: 'Data Analyst', email: 'jessica.taylor@company.com' }
]