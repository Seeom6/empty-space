import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeList } from './EmployeeList'
import { EmployeeProfile } from './EmployeeProfile'
import { CreateEditEmployeeModal } from './CreateEditEmployeeModal'
import { EmployeeWidgets } from './EmployeeWidgets'
import { mockEmployees } from './mockData'
import { Employee } from './types'

interface EmployeeManagementProps {
  userRole: string
}

type ViewMode = 'overview' | 'list' | 'profile'

export function EmployeeManagement({ userRole }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  // Filter employees based on user role
  const getFilteredEmployees = () => {
    switch (userRole) {
      case 'Admin':
      case 'HR':
        return employees
      case 'Manager':
        // Show employees managed by this user (mock logic)
        return employees.filter(emp => emp.managerId === 'current-user-id')
      case 'Employee':
        // Show only own profile (mock logic)
        return employees.filter(emp => emp.id === 'current-user-id')
      default:
        return []
    }
  }

  const filteredEmployees = getFilteredEmployees()

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setViewMode('profile')
  }

  const handleCreateEmployee = () => {
    setEditingEmployee(null)
    setIsCreateModalOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsCreateModalOpen(true)
  }

  const handleSaveEmployee = (employeeData: Partial<Employee>) => {
    if (editingEmployee) {
      // Update existing employee
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...employeeData } as Employee
          : emp
      ))
      if (selectedEmployee && selectedEmployee.id === editingEmployee.id) {
        setSelectedEmployee({ ...selectedEmployee, ...employeeData } as Employee)
      }
    } else {
      // Add new employee
      const newEmployee = employeeData as Employee
      setEmployees([...employees, newEmployee])
    }
  }

  const handleBackToList = () => {
    setSelectedEmployee(null)
    setViewMode('list')
  }

  // Check permissions
  const canViewOverview = userRole === 'Admin' || userRole === 'HR'
  const canViewAllEmployees = userRole === 'Admin' || userRole === 'HR' || userRole === 'Manager'

  if (!canViewAllEmployees && userRole === 'Employee') {
    // Employee can only view their own profile
    const ownProfile = employees.find(emp => emp.id === 'current-user-id')
    if (ownProfile) {
      return (
        <div className="p-6">
          <EmployeeProfile
            employee={ownProfile}
            onEdit={handleEditEmployee}
            onClose={() => {}}
            userRole={userRole}
          />
          <CreateEditEmployeeModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleSaveEmployee}
            employee={editingEmployee || undefined}
            employees={employees}
          />
        </div>
      )
    } else {
      return (
        <div className="p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <h2>Employee Profile</h2>
              <p className="text-muted-foreground mt-2">
                Your profile information is not available.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return (
    <div className="p-6">
      {viewMode === 'profile' && selectedEmployee ? (
        <>
          <EmployeeProfile
            employee={selectedEmployee}
            onEdit={handleEditEmployee}
            onClose={handleBackToList}
            userRole={userRole}
          />
        </>
      ) : (
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <TabsList>
            {canViewOverview && <TabsTrigger value="overview">Overview</TabsTrigger>}
            <TabsTrigger value="list">Directory</TabsTrigger>
          </TabsList>

          {canViewOverview && (
            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h2>Employee Overview</h2>
                  <p className="text-muted-foreground mt-1">
                    Key metrics and insights about your workforce
                  </p>
                </div>
                <EmployeeWidgets employees={filteredEmployees} />
              </div>
            </TabsContent>
          )}

          <TabsContent value="list" className="mt-6">
            <EmployeeList
              employees={filteredEmployees}
              onSelectEmployee={handleSelectEmployee}
              onCreateEmployee={handleCreateEmployee}
              userRole={userRole}
            />
          </TabsContent>
        </Tabs>
      )}

      <CreateEditEmployeeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={editingEmployee || undefined}
        employees={employees}
      />
    </div>
  )
}