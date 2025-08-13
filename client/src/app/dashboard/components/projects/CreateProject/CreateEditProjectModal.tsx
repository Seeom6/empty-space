import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Project } from '../ProjectManagement'
import { useProjectForm } from './hooks/useProjectForm'
import { BasicInfoTab } from './components/BasicInfoTab'
import { TeamTechTab } from './components/TeamTechTab'
import { BudgetTimelineTab } from './components/BudgetTimelineTab'

interface CreateEditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  users: Array<{ id: string; name: string; avatar: string }>
  technologies: string[]
  mode: 'create' | 'edit'
  project?: Project
}

export function CreateEditProjectModal({
  isOpen,
  onClose,
  onSave,
  users,
  technologies,
  mode,
  project
}: CreateEditProjectModalProps) {
  const {
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
  } = useProjectForm({
    mode,
    project,
    isOpen,
    users,
    onSave,
    onClose
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Set up a new project with team members, technologies, and budget details.' 
              : 'Update project information, team members, and budget tracking.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="team">Team & Tech</TabsTrigger>
              <TabsTrigger value="budget">Budget & Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <BasicInfoTab
                formData={formData}
                setFormData={setFormData}
                tagInput={tagInput}
                setTagInput={setTagInput}
                addTag={addTag}
                removeTag={removeTag}
                mode={mode}
              />
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <TeamTechTab
                formData={formData}
                setFormData={setFormData}
                users={users}
                technologies={technologies}
                techInput={techInput}
                setTechInput={setTechInput}
                addTechnology={addTechnology}
                toggleTechnology={toggleTechnology}
                removeTechnology={removeTechnology}
                addTeamMember={addTeamMember}
                removeTeamMember={removeTeamMember}
                updateMemberRole={updateMemberRole}
              />
            </TabsContent>

            <TabsContent value="budget" className="space-y-4">
              <BudgetTimelineTab
                formData={formData}
                setFormData={setFormData}
                isStartDateOpen={isStartDateOpen}
                setIsStartDateOpen={setIsStartDateOpen}
                isEndDateOpen={isEndDateOpen}
                setIsEndDateOpen={setIsEndDateOpen}
                isDeadlineOpen={isDeadlineOpen}
                setIsDeadlineOpen={setIsDeadlineOpen}
                mode={mode}
              />
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create Project' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
