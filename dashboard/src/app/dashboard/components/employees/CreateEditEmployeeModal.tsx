import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X } from 'lucide-react'
import { Employee, departments, jobTitles, technologies } from './types'

interface CreateEditEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (employee: Partial<Employee>) => void
  employee?: Employee
  employees: Employee[] // For manager selection
}

interface EmployeeForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: 'Male' | 'Female' | 'Other' | ''
  birthDate: string
  address: string
  position: string
  department: string
  jobTitle: string
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | ''
  status: 'Active' | 'Inactive' | 'Terminated' | ''
  hireDate: string
  managerId: string
  manager: string
  technologies: string[]
  baseSalary: string
  bonuses: string
  deductions: string
}

export function CreateEditEmployeeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  employee, 
  employees 
}: CreateEditEmployeeModalProps) {
  const [activeTab, setActiveTab] = useState('personal')
  const [form, setForm] = useState<EmployeeForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    birthDate: '',
    address: '',
    position: '',
    department: '',
    jobTitle: '',
    employmentType: '',
    status: 'Active',
    hireDate: new Date().toISOString().split('T')[0],
    managerId: '',
    manager: '',
    technologies: [],
    baseSalary: '',
    bonuses: '0',
    deductions: '0'
  })

  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
  const [techSearch, setTechSearch] = useState('')

  const isEditing = !!employee

  // Get potential managers (exclude current employee and their subordinates)
  const potentialManagers = employees.filter(emp => 
    emp.id !== employee?.id && 
    emp.managerId !== employee?.id &&
    emp.status === 'Active'
  )

  useEffect(() => {
    if (employee) {
      setForm({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        gender: employee.gender,
        birthDate: employee.birthDate,
        address: employee.address,
        position: employee.position,
        department: employee.department,
        jobTitle: employee.jobTitle,
        employmentType: employee.employmentType,
        status: employee.status,
        hireDate: employee.hireDate,
        managerId: employee.managerId || '',
        manager: employee.manager || '',
        technologies: employee.technologies,
        baseSalary: employee.salary.base.toString(),
        bonuses: employee.salary.bonuses.toString(),
        deductions: employee.salary.deductions.toString()
      })
      setSelectedTechnologies(employee.technologies)
    } else {
      // Reset form for new employee
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: '',
        birthDate: '',
        address: '',
        position: '',
        department: '',
        jobTitle: '',
        employmentType: '',
        status: 'Active',
        hireDate: new Date().toISOString().split('T')[0],
        managerId: '',
        manager: '',
        technologies: [],
        baseSalary: '',
        bonuses: '0',
        deductions: '0'
      })
      setSelectedTechnologies([])
    }
  }, [employee])

  const handleSubmit = () => {
    const selectedManager = potentialManagers.find(emp => emp.id === form.managerId)
    
    const employeeData: Partial<Employee> = {
      ...employee,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      gender: form.gender as 'Male' | 'Female' | 'Other',
      birthDate: form.birthDate,
      address: form.address,
      position: form.position,
      department: form.department,
      jobTitle: form.jobTitle,
      employmentType: form.employmentType as 'Full-Time' | 'Part-Time' | 'Contract',
      status: form.status as 'Active' | 'Inactive' | 'Terminated',
      hireDate: form.hireDate,
      managerId: form.managerId || undefined,
      manager: selectedManager ? `${selectedManager.firstName} ${selectedManager.lastName}` : undefined,
      technologies: selectedTechnologies,
      salary: {
        base: parseInt(form.baseSalary) || 0,
        bonuses: parseInt(form.bonuses) || 0,
        deductions: parseInt(form.deductions) || 0,
        net: (parseInt(form.baseSalary) || 0) + (parseInt(form.bonuses) || 0) - (parseInt(form.deductions) || 0)
      }
    }

    if (!isEditing) {
      employeeData.id = `emp-${Date.now()}`
      employeeData.attendance = { present: 0, late: 0, absent: 0 }
      employeeData.performance = { rating: 3.0, goals: [], feedback: [] }
      employeeData.projects = []
      employeeData.teams = []
    }

    onSave(employeeData)
    onClose()
  }

  const addTechnology = (tech: string) => {
    if (!selectedTechnologies.includes(tech)) {
      setSelectedTechnologies([...selectedTechnologies, tech])
    }
    setTechSearch('')
  }

  const removeTechnology = (tech: string) => {
    setSelectedTechnologies(selectedTechnologies.filter(t => t !== tech))
  }

  const filteredTechnologies = technologies.filter(tech => 
    tech.toLowerCase().includes(techSearch.toLowerCase()) &&
    !selectedTechnologies.includes(tech)
  )

  const isFormValid = () => {
    return form.firstName && form.lastName && form.email && form.department && 
           form.position && form.jobTitle && form.employmentType && form.hireDate
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update employee information and job details.' : 'Fill in the information to add a new employee to your organization.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="job">Job Details</TabsTrigger>
            <TabsTrigger value="skills">Skills & Tech</TabsTrigger>
            <TabsTrigger value="compensation">Compensation</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={form.gender} onValueChange={(value: any) => setForm({ ...form, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Date of Birth</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={form.birthDate}
                      onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Enter full address"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="job" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      placeholder="Enter position/role"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={form.department} onValueChange={(value) => setForm({ ...form, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Select value={form.jobTitle} onValueChange={(value) => setForm({ ...form, jobTitle: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job title" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTitles.map(title => (
                          <SelectItem key={title} value={title}>{title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type *</Label>
                    <Select value={form.employmentType} onValueChange={(value: any) => setForm({ ...form, employmentType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-Time">Full-Time</SelectItem>
                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={form.status} onValueChange={(value: any) => setForm({ ...form, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Hire Date *</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={form.hireDate}
                      onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Select value={form.managerId} onValueChange={(value) => {
                    const selectedManager = potentialManagers.find(emp => emp.id === value)
                    setForm({ 
                      ...form, 
                      managerId: value,
                      manager: selectedManager ? `${selectedManager.firstName} ${selectedManager.lastName}` : ''
                    })
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No manager</SelectItem>
                      {potentialManagers.map(manager => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.firstName} {manager.lastName} ({manager.position})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Technologies & Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="techSearch">Add Technologies</Label>
                  <Input
                    id="techSearch"
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    placeholder="Search and add technologies..."
                  />
                  {techSearch && filteredTechnologies.length > 0 && (
                    <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                      {filteredTechnologies.slice(0, 5).map(tech => (
                        <button
                          key={tech}
                          className="block w-full text-left p-1 hover:bg-muted rounded text-sm"
                          onClick={() => addTechnology(tech)}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Selected Technologies</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTechnologies.map(tech => (
                      <Badge key={tech} variant="secondary" className="gap-1">
                        {tech}
                        <button
                          onClick={() => removeTechnology(tech)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {selectedTechnologies.length === 0 && (
                    <p className="text-sm text-muted-foreground">No technologies selected</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compensation" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Salary Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseSalary">Base Salary ($)</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      value={form.baseSalary}
                      onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                      placeholder="Enter base salary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonuses">Annual Bonuses ($)</Label>
                    <Input
                      id="bonuses"
                      type="number"
                      value={form.bonuses}
                      onChange={(e) => setForm({ ...form, bonuses: e.target.value })}
                      placeholder="Enter bonus amount"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deductions">Annual Deductions ($)</Label>
                    <Input
                      id="deductions"
                      type="number"
                      value={form.deductions}
                      onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                      placeholder="Enter deduction amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Net Annual Salary</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <span className="font-medium">
                        ${((parseInt(form.baseSalary) || 0) + (parseInt(form.bonuses) || 0) - (parseInt(form.deductions) || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>* Salary information is only visible to Admin and HR roles</p>
                  <p>* All amounts should be entered as annual figures</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid()}>
            {isEditing ? 'Update Employee' : 'Add Employee'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}