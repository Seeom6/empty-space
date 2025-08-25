'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign } from 'lucide-react'
import { PayrollEntry } from './types'
import { CreateEditPayrollModal } from './CreateEditPayrollModal'
import { EmployeePayrollProfile } from './EmployeePayrollProfile'
import { PayrollDashboard } from './PayrollDashboard'
import { canManagePayroll } from './utils'

interface PayrollManagementProps {
  userRole: string
}

type ViewMode = 'dashboard' | 'profile'

// Mock employee data for the modal
const mockEmployees = [
  { id: 'emp-1', name: 'John Doe', department: 'Engineering', baseSalary: 8500 },
  { id: 'emp-2', name: 'Jane Smith', department: 'Engineering', baseSalary: 11000 },
  { id: 'emp-3', name: 'Mike Johnson', department: 'Design', baseSalary: 7200 },
  { id: 'emp-4', name: 'Sarah Wilson', department: 'Design', baseSalary: 9500 },
  { id: 'emp-5', name: 'David Brown', department: 'Marketing', baseSalary: 6800 },
  { id: 'emp-6', name: 'Lisa Garcia', department: 'Marketing', baseSalary: 8800 },
  { id: 'emp-7', name: 'Alex Chen', department: 'Engineering', baseSalary: 7800 },
  { id: 'emp-8', name: 'Emma Davis', department: 'HR', baseSalary: 6500 }
]

export function PayrollManagement({ userRole }: PayrollManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [selectedEmployee, setSelectedEmployee] = useState<{
    employeeId: string
    month: string
    year: number
  } | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PayrollEntry | null>(null)

  const handleSelectEmployee = (employeeId: string, month: string, year: number) => {
    setSelectedEmployee({ employeeId, month, year })
    setViewMode('profile')
  }

  const handleCreatePayroll = () => {
    setEditingEntry(null)
    setIsCreateModalOpen(true)
  }

  const handleEditPayroll = (entry: PayrollEntry) => {
    setEditingEntry(entry)
    setIsCreateModalOpen(true)
  }

  const handleSavePayroll = (payrollData: Partial<PayrollEntry>) => {
    // Handle save logic here
    setIsCreateModalOpen(false)
    setEditingEntry(null)
  }

  const handleBackToDashboard = () => {
    setSelectedEmployee(null)
    setViewMode('dashboard')
  }

  // Check permissions
  const canAccessPayroll = canManagePayroll(userRole)

  if (!canAccessPayroll) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to access payroll information.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Employee view - only their own payroll
  if (userRole === 'Employee') {
    return (
      <div className="p-6">
        <EmployeePayrollProfile
          employeeId="emp-1" // In real app, this would be current user's ID
          onBack={() => {}} // No back button for employees
          userRole={userRole}
        />

        <CreateEditPayrollModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSavePayroll}
          entry={editingEntry || undefined}
          employees={mockEmployees}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      {viewMode === 'profile' && selectedEmployee ? (
        <EmployeePayrollProfile
          employeeId={selectedEmployee.employeeId}
          selectedMonth={selectedEmployee.month}
          selectedYear={selectedEmployee.year}
          onBack={handleBackToDashboard}
          userRole={userRole}
        />
      ) : (
        <PayrollDashboard
          onSelectEmployee={handleSelectEmployee}
          onCreatePayroll={handleCreatePayroll}
          onEditPayroll={handleEditPayroll}
          userRole={userRole}
        />
      )}

      <CreateEditPayrollModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSavePayroll}
        entry={editingEntry || undefined}
        employees={mockEmployees}
      />
    </div>
  )
}