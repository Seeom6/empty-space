import { Employee } from './types'

export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    gender: 'Male',
    birthDate: '1990-05-15',
    address: '123 Main St, New York, NY 10001',
    position: 'Senior Software Engineer',
    department: 'Engineering',
    jobTitle: 'Senior Software Engineer',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2022-03-15',
    manager: 'Jane Smith',
    managerId: 'emp-2',
    technologies: ['React', 'Node.js', 'TypeScript', 'AWS'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    salary: {
      base: 95000,
      bonuses: 8000,
      deductions: 12000,
      net: 91000
    },
    attendance: {
      present: 142,
      late: 8,
      absent: 3
    },
    performance: {
      rating: 4.2,
      goals: ['Complete React migration', 'Mentor junior developers', 'Improve code coverage'],
      feedback: ['Excellent technical skills', 'Great team player', 'Needs to improve time management']
    },
    projects: ['E-commerce Platform', 'Mobile App'],
    teams: ['Frontend Team', 'Core Platform']
  },
  {
    id: 'emp-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    phone: '+1 (555) 234-5678',
    gender: 'Female',
    birthDate: '1985-08-22',
    address: '456 Oak Ave, San Francisco, CA 94102',
    position: 'Engineering Manager',
    department: 'Engineering',
    jobTitle: 'Engineering Manager',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2020-01-10',
    technologies: ['React', 'Python', 'AWS', 'Docker'],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    salary: {
      base: 125000,
      bonuses: 15000,
      deductions: 18000,
      net: 122000
    },
    attendance: {
      present: 145,
      late: 5,
      absent: 1
    },
    performance: {
      rating: 4.8,
      goals: ['Scale engineering team', 'Improve deployment processes', 'Reduce technical debt'],
      feedback: ['Excellent leadership', 'Strategic thinker', 'Great at mentoring']
    },
    projects: ['E-commerce Platform', 'API Gateway', 'DevOps Infrastructure'],
    teams: ['Engineering Leadership', 'Frontend Team']
  },
  {
    id: 'emp-3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@company.com',
    phone: '+1 (555) 345-6789',
    gender: 'Male',
    birthDate: '1992-12-03',
    address: '789 Pine St, Austin, TX 73301',
    position: 'UX Designer',
    department: 'Design',
    jobTitle: 'UX Designer',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2021-09-01',
    manager: 'Sarah Wilson',
    managerId: 'emp-4',
    technologies: ['Figma', 'Adobe Creative Suite', 'Sketch', 'Principle'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    salary: {
      base: 78000,
      bonuses: 6000,
      deductions: 9500,
      net: 74500
    },
    attendance: {
      present: 138,
      late: 12,
      absent: 4
    },
    performance: {
      rating: 4.0,
      goals: ['Improve user research skills', 'Lead design system project', 'Collaborate with engineering'],
      feedback: ['Creative problem solver', 'Good eye for detail', 'Needs to be more proactive']
    },
    projects: ['Mobile App', 'Design System'],
    teams: ['Design Team', 'Product Team']
  },
  {
    id: 'emp-4',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@company.com',
    phone: '+1 (555) 456-7890',
    gender: 'Female',
    birthDate: '1988-02-14',
    address: '321 Elm St, Seattle, WA 98101',
    position: 'Design Manager',
    department: 'Design',
    jobTitle: 'Design Manager',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2019-06-15',
    technologies: ['Figma', 'Adobe Creative Suite', 'Sketch', 'InVision'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    salary: {
      base: 110000,
      bonuses: 12000,
      deductions: 15000,
      net: 107000
    },
    attendance: {
      present: 147,
      late: 3,
      absent: 2
    },
    performance: {
      rating: 4.6,
      goals: ['Build design culture', 'Hire more designers', 'Implement design ops'],
      feedback: ['Great leadership skills', 'Excellent design vision', 'Strong team builder']
    },
    projects: ['Design System', 'Brand Refresh', 'Mobile App'],
    teams: ['Design Team', 'Leadership Team']
  },
  {
    id: 'emp-5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@company.com',
    phone: '+1 (555) 567-8901',
    gender: 'Male',
    birthDate: '1995-07-30',
    address: '654 Maple Ave, Denver, CO 80202',
    position: 'Marketing Specialist',
    department: 'Marketing',
    jobTitle: 'Marketing Specialist',
    employmentType: 'Part-Time',
    status: 'Active',
    hireDate: '2023-02-01',
    manager: 'Lisa Garcia',
    managerId: 'emp-6',
    technologies: ['HubSpot', 'Google Analytics', 'Mailchimp', 'Canva'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    salary: {
      base: 45000,
      bonuses: 3000,
      deductions: 5500,
      net: 42500
    },
    attendance: {
      present: 89,
      late: 6,
      absent: 2
    },
    performance: {
      rating: 3.8,
      goals: ['Improve conversion rates', 'Learn SEO', 'Create more content'],
      feedback: ['Eager to learn', 'Good analytical skills', 'Needs more experience']
    },
    projects: ['Brand Refresh', 'Lead Generation'],
    teams: ['Marketing Team']
  },
  {
    id: 'emp-6',
    firstName: 'Lisa',
    lastName: 'Garcia',
    email: 'lisa.garcia@company.com',
    phone: '+1 (555) 678-9012',
    gender: 'Female',
    birthDate: '1987-11-18',
    address: '987 Cedar St, Miami, FL 33101',
    position: 'Marketing Manager',
    department: 'Marketing',
    jobTitle: 'Marketing Manager',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2020-08-20',
    technologies: ['HubSpot', 'Salesforce', 'Google Analytics', 'Adobe Creative Suite'],
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    salary: {
      base: 98000,
      bonuses: 10000,
      deductions: 13000,
      net: 95000
    },
    attendance: {
      present: 144,
      late: 7,
      absent: 1
    },
    performance: {
      rating: 4.4,
      goals: ['Increase brand awareness', 'Optimize marketing funnel', 'Build partnerships'],
      feedback: ['Strategic thinker', 'Data-driven approach', 'Great at execution']
    },
    projects: ['Brand Refresh', 'Lead Generation', 'Partnership Program'],
    teams: ['Marketing Team', 'Leadership Team']
  },
  {
    id: 'emp-7',
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@company.com',
    phone: '+1 (555) 789-0123',
    gender: 'Other',
    birthDate: '1993-04-12',
    address: '147 Birch Rd, Portland, OR 97201',
    position: 'Software Engineer',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    employmentType: 'Full-Time',
    status: 'Inactive',
    hireDate: '2022-11-01',
    manager: 'Jane Smith',
    managerId: 'emp-2',
    technologies: ['Python', 'Django', 'PostgreSQL', 'Redis'],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    salary: {
      base: 82000,
      bonuses: 5000,
      deductions: 10000,
      net: 77000
    },
    attendance: {
      present: 67,
      late: 15,
      absent: 8
    },
    performance: {
      rating: 3.2,
      goals: ['Improve code quality', 'Learn new technologies', 'Better time management'],
      feedback: ['Technical skills need improvement', 'Often late to meetings', 'Potential for growth']
    },
    projects: ['API Gateway'],
    teams: ['Backend Team']
  },
  {
    id: 'emp-8',
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis@company.com',
    phone: '+1 (555) 890-1234',
    gender: 'Female',
    birthDate: '1991-09-25',
    address: '258 Willow Dr, Boston, MA 02101',
    position: 'HR Specialist',
    department: 'HR',
    jobTitle: 'HR Specialist',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2021-04-12',
    manager: 'Robert Taylor',
    managerId: 'emp-9',
    technologies: ['Workday', 'BambooHR', 'Slack', 'Microsoft Office'],
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
    salary: {
      base: 65000,
      bonuses: 4000,
      deductions: 8500,
      net: 60500
    },
    attendance: {
      present: 146,
      late: 4,
      absent: 2
    },
    performance: {
      rating: 4.1,
      goals: ['Improve onboarding process', 'Reduce time-to-hire', 'Enhance employee satisfaction'],
      feedback: ['Great with people', 'Detail-oriented', 'Needs to be more assertive']
    },
    projects: ['HR System Upgrade', 'Employee Wellness Program'],
    teams: ['HR Team']
  }
]