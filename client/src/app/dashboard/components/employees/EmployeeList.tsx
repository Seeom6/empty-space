import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Plus, Filter } from 'lucide-react'
import { Employee, EmployeeFilters, departments, jobTitles } from './types'

interface EmployeeListProps {
  employees: Employee[]
  onSelectEmployee: (employee: Employee) => void
  onCreateEmployee: () => void
  userRole: string
}

export function EmployeeList({ employees, onSelectEmployee, onCreateEmployee, userRole }: EmployeeListProps) {
  const [filters, setFilters] = useState<EmployeeFilters>({
    department: 'all',
    status: 'all',
    employmentType: 'all',
    jobTitle: 'all',
    manager: 'all',
    search: ''
  })

  const [showFilters, setShowFilters] = useState(false)

  // Get unique managers for filter
  const managers = Array.from(new Set(employees.filter(emp => emp.manager).map(emp => emp.manager)))

  // Filter employees based on current filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.position.toLowerCase().includes(filters.search.toLowerCase())

    const matchesDepartment = filters.department === 'all' || employee.department === filters.department
    const matchesStatus = filters.status === 'all' || employee.status === filters.status
    const matchesEmploymentType = filters.employmentType === 'all' || employee.employmentType === filters.employmentType
    const matchesJobTitle = filters.jobTitle === 'all' || employee.jobTitle === filters.jobTitle
    const matchesManager = filters.manager === 'all' || employee.manager === filters.manager

    return matchesSearch && matchesDepartment && matchesStatus && matchesEmploymentType && matchesJobTitle && matchesManager
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
      case 'Inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'Terminated':
        return <Badge variant="destructive">Terminated</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getEmploymentTypeBadge = (type: string) => {
    switch (type) {
      case 'Full-Time':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Full-Time</Badge>
      case 'Part-Time':
        return <Badge variant="outline">Part-Time</Badge>
      case 'Contract':
        return <Badge variant="secondary">Contract</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const canCreateEmployee = userRole === 'Admin' || userRole === 'HR'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Employee Directory</h2>
          <p className="text-muted-foreground mt-1">
            Manage and view all employees in your organization
          </p>
        </div>
        {canCreateEmployee && (
          <Button onClick={onCreateEmployee} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select value={filters.department} onValueChange={(value) => setFilters({ ...filters, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.employmentType} onValueChange={(value) => setFilters({ ...filters, employmentType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.jobTitle} onValueChange={(value) => setFilters({ ...filters, jobTitle: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Titles</SelectItem>
                  {jobTitles.map(title => (
                    <SelectItem key={title} value={title}>{title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.manager} onValueChange={(value) => setFilters({ ...filters, manager: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Managers</SelectItem>
                  {managers.map(manager => (
                    <SelectItem key={manager} value={manager!}>{manager}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Employee Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Employment Type</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map(employee => (
                  <TableRow
                    key={employee.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onSelectEmployee(employee)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                          <AvatarFallback>
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{employee.firstName} {employee.lastName}</div>
                          <div className="text-sm text-muted-foreground">{employee.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell>{getEmploymentTypeBadge(employee.employmentType)}</TableCell>
                    <TableCell>
                      {employee.manager || (
                        <span className="text-muted-foreground">No manager</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{employee.email}</div>
                        <div className="text-muted-foreground">{employee.phone}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No employees found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Showing {filteredEmployees.length} of {employees.length} employees
      </div>
    </div>
  )
}