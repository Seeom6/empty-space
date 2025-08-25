'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeAttendanceDashboard } from './EmployeeAttendanceDashboard'
import { AttendanceOverview } from './AttendanceOverview'
import { TeamAttendanceView } from './TeamAttendanceView'

interface AttendanceManagementProps {
  userRole: string
}

export function AttendanceManagement({ userRole }: AttendanceManagementProps) {
  const [activeTab, setActiveTab] = useState(() => {
    // Default tab based on user role
    switch (userRole) {
      case 'Employee':
        return 'personal'
      case 'Manager':
        return 'team'
      case 'HR':
      case 'Admin':
      default:
        return 'overview'
    }
  })

  // Determine available tabs based on user role
  const getAvailableTabs = () => {
    const tabs = []
    
    if (userRole === 'Admin' || userRole === 'HR') {
      tabs.push({ value: 'overview', label: 'Overview', component: AttendanceOverview })
    }
    
    if (userRole === 'Manager' || userRole === 'Admin' || userRole === 'HR') {
      tabs.push({ value: 'team', label: 'Team View', component: TeamAttendanceView })
    }
    
    // All users can see their personal attendance
    tabs.push({ value: 'personal', label: 'My Attendance', component: EmployeeAttendanceDashboard })
    
    return tabs
  }

  const availableTabs = getAvailableTabs()

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {availableTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {availableTabs.map(tab => {
          const Component = tab.component
          return (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              <Component userRole={userRole} />
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}