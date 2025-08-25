import { useState, useEffect } from 'react'
import { Project } from '../../ProjectManagement'
import { ProjectFormData } from '../types'

interface UseProjectFormProps {
  mode: 'create' | 'edit'
  project?: Project
  isOpen: boolean
  users: Array<{ id: string; name: string; avatar: string }>
  onSave: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
}

export function useProjectForm({
  mode,
  project,
  isOpen,
  users,
  onSave,
  onClose
}: UseProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    progress: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    budget: 0,
    currency: 'USD',
    actualSpent: 0,
    managerId: '',
    teamMembers: [] as Array<{ userId: string; role: string }>,
    selectedTechnologies: [] as string[],
    tags: [] as string[]
  })

  const [tagInput, setTagInput] = useState('')
  const [techInput, setTechInput] = useState('')
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        progress: project.progress,
        startDate: new Date(project.startDate),
        endDate: new Date(project.endDate),
        deadline: new Date(project.deadline),
        budget: project.budget,
        currency: project.currency,
        actualSpent: project.actualSpent,
        managerId: project.manager.id,
        teamMembers: project.team.map(member => ({
          userId: member.id,
          role: member.role
        })),
        selectedTechnologies: [...project.technologies],
        tags: [...project.tags]
      })
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        progress: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        budget: 0,
        currency: 'USD',
        actualSpent: 0,
        managerId: '',
        teamMembers: [],
        selectedTechnologies: [],
        tags: []
      })
    }
  }, [mode, project, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const manager = users.find(u => u.id === formData.managerId)
    if (!manager) return

    const team = formData.teamMembers.map(tm => {
      const user = users.find(u => u.id === tm.userId)
      return user ? { ...user, role: tm.role } : null
    }).filter(Boolean) as Array<{ id: string; name: string; avatar: string; role: string }>

    // Ensure manager is in team
    if (!team.find(member => member.id === manager.id)) {
      team.unshift({ ...manager, role: 'Project Manager' })
    }

    onSave({
      name: formData.name,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      progress: formData.progress,
      startDate: formData.startDate.toISOString().split('T')[0],
      endDate: formData.endDate.toISOString().split('T')[0],
      deadline: formData.deadline.toISOString().split('T')[0],
      budget: formData.budget,
      currency: formData.currency,
      actualSpent: formData.actualSpent,
      manager,
      team,
      technologies: formData.selectedTechnologies,
      tags: formData.tags
    })

    onClose()
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addTechnology = () => {
    if (techInput.trim() && !formData.selectedTechnologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        selectedTechnologies: [...prev.selectedTechnologies, techInput.trim()]
      }))
      setTechInput('')
    }
  }

  const toggleTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTechnologies: prev.selectedTechnologies.includes(tech)
        ? prev.selectedTechnologies.filter(t => t !== tech)
        : [...prev.selectedTechnologies, tech]
    }))
  }

  const removeTechnology = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTechnologies: prev.selectedTechnologies.filter(tech => tech !== techToRemove)
    }))
  }

  const addTeamMember = (userId: string) => {
    if (!formData.teamMembers.find(tm => tm.userId === userId)) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, { userId, role: 'Developer' }]
      }))
    }
  }

  const removeTeamMember = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(tm => tm.userId !== userId)
    }))
  }

  const updateMemberRole = (userId: string, role: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(tm =>
        tm.userId === userId ? { ...tm, role } : tm
      )
    }))
  }

  return {
    formData,
    setFormData,
    tagInput,
    setTagInput,
    techInput,
    setTechInput,
    isStartDateOpen,
    setIsStartDateOpen,
    isEndDateOpen,
    setIsEndDateOpen,
    isDeadlineOpen,
    setIsDeadlineOpen,
    handleSubmit,
    addTag,
    removeTag,
    addTechnology,
    toggleTechnology,
    removeTechnology,
    addTeamMember,
    removeTeamMember,
    updateMemberRole
  }
}
