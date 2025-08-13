import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

const roles = ['Project Manager', 'Senior Developer', 'Developer', 'UI Designer', 'UX Designer', 'QA Engineer', 'DevOps Engineer', 'Data Analyst', 'Security Engineer']

interface FormData {
  managerId: string
  teamMembers: Array<{ userId: string; role: string }>
  selectedTechnologies: string[]
  [key: string]: any
}

interface TeamTechTabProps {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  users: Array<{ id: string; name: string; avatar: string }>
  technologies: string[]
  techInput: string
  setTechInput: (value: string) => void
  addTechnology: () => void
  toggleTechnology: (tech: string) => void
  removeTechnology: (tech: string) => void
  addTeamMember: (userId: string) => void
  removeTeamMember: (userId: string) => void
  updateMemberRole: (userId: string, role: string) => void
}

export function TeamTechTab({
  formData,
  setFormData,
  users,
  technologies,
  techInput,
  setTechInput,
  addTechnology,
  toggleTechnology,
  removeTechnology,
  addTeamMember,
  removeTeamMember,
  updateMemberRole
}: TeamTechTabProps) {
  return (
    <>
      {/* Project Manager */}
      <div className="space-y-2">
        <Label>Project Manager *</Label>
        <Select
          value={formData.managerId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, managerId: value }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select project manager" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Team Members */}
      <div className="space-y-3">
        <Label>Team Members</Label>
        
        {/* Add Team Member */}
        <div className="border rounded-lg p-3">
          <Label className="text-sm font-medium mb-2 block">Add Team Members</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {users.filter(user => user.id !== formData.managerId).map(user => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.teamMembers.some(tm => tm.userId === user.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      addTeamMember(user.id)
                    } else {
                      removeTeamMember(user.id)
                    }
                  }}
                />
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm flex-1">{user.name}</span>
                {formData.teamMembers.some(tm => tm.userId === user.id) && (
                  <Select
                    value={formData.teamMembers.find(tm => tm.userId === user.id)?.role || 'Developer'}
                    onValueChange={(role) => updateMemberRole(user.id, role)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Technologies */}
      <div className="space-y-3">
        <Label>Technologies</Label>
        
        {/* Add Custom Technology */}
        <div className="flex space-x-2">
          <Input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="Add technology..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
          />
          <Button type="button" onClick={addTechnology} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Technology Checkboxes */}
        <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
          {technologies.map(tech => (
            <div key={tech} className="flex items-center space-x-2">
              <Checkbox
                checked={formData.selectedTechnologies.includes(tech)}
                onCheckedChange={() => toggleTechnology(tech)}
              />
              <span className="text-sm">{tech}</span>
            </div>
          ))}
        </div>

        {/* Selected Technologies */}
        {formData.selectedTechnologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.selectedTechnologies.map(tech => (
              <Badge key={tech} variant="outline" className="cursor-pointer" onClick={() => removeTechnology(tech)}>
                {tech}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
