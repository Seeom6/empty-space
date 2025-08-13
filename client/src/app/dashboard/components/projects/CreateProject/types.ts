import { Project } from '../ProjectManagement'

export interface ProjectFormData {
  name: string
  description: string
  status: Project['status']
  priority: Project['priority']
  progress: number
  startDate: Date
  endDate: Date
  deadline: Date
  budget: number
  currency: string
  actualSpent: number
  tags: string[]
  managerId: string
  teamMembers: Array<{ userId: string; role: string }>
  selectedTechnologies: string[]
  [key: string]: any
}
