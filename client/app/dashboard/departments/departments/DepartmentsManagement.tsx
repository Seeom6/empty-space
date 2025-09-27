"use client"
import React, { useState, useMemo } from "react"
import { Plus, Search, Filter, MoreHorizontal, Building2, Users, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { ErrorAlert } from "@/components/ui/ErrorAlert"
import { useDepartments, useDeleteDepartment, useDepartmentStatistics } from "@/lib/api/hooks/useDepartment"
import { Department, Status } from "@/lib/api/types"
import { DepartmentForm } from "./components/DepartmentForm"
import { DepartmentDetail } from "./components/DepartmentDetail"
import { DepartmentFilters } from "./components/DepartmentFilters"
import { DepartmentStats } from "./components/DepartmentStats"

interface DepartmentsManagementProps {
  userRole: string
}

export const DepartmentsManagement: React.FC<DepartmentsManagementProps> = ({ userRole }) => {
  // State management
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL")
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // API hooks
  const { data: departmentsRaw = [], isLoading, error, refetch } = useDepartments()
  const { data: stats, isLoading: statsLoading } = useDepartmentStatistics()
  const deleteMutation = useDeleteDepartment()

  // Ensure departments is always an array - FINAL FIX
  const departments = Array.isArray(departmentsRaw) ? departmentsRaw : []

  console.log('🔍 COMPONENT DEBUG - departmentsRaw:', departmentsRaw);
  console.log('🔍 COMPONENT DEBUG - departments (final):', departments);
  console.log('🔍 COMPONENT DEBUG - Array.isArray(departments):', Array.isArray(departments));
  console.log('🔍 COMPONENT DEBUG - isLoading:', isLoading);
  console.log('🔍 COMPONENT DEBUG - error:', error);
  console.log('🔍 COMPONENT DEBUG - departments.length:', departments.length);

  // Filtered and sorted departments
  const filteredDepartments = useMemo(() => {
    console.log('🔍 FILTERING DEBUG - departments:', departments);
    console.log('🔍 FILTERING DEBUG - searchQuery:', searchQuery);
    console.log('🔍 FILTERING DEBUG - statusFilter:', statusFilter);

    const filtered = departments.filter(department => {
      console.log('🔍 FILTERING DEBUG - checking department:', department);

      // Filter by search query
      const matchesSearch = !searchQuery ||
        department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (department.description && department.description.toLowerCase().includes(searchQuery.toLowerCase()))

      // Filter by status
      const matchesStatus = statusFilter === "ALL" || department.status === statusFilter

      // Filter out deleted departments
      const notDeleted = !department.isDeleted

      console.log('🔍 FILTERING DEBUG - matchesSearch:', matchesSearch, 'matchesStatus:', matchesStatus, 'notDeleted:', notDeleted);

      return matchesSearch && matchesStatus && notDeleted
    }).sort((a, b) => a.name.localeCompare(b.name))

    console.log('🔍 FILTERING DEBUG - filtered result:', filtered);
    console.log('🔍 FILTERING DEBUG - filtered length:', filtered.length);

    return filtered;
  }, [departments, searchQuery, statusFilter])

  // Event handlers
  const handleCreateDepartment = () => {
    setSelectedDepartment(null)
    setIsCreateModalOpen(true)
  }

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department)
    setIsEditModalOpen(true)
  }

  const handleViewDepartment = (department: Department) => {
    setSelectedDepartment(department)
    setIsDetailModalOpen(true)
  }

  const handleDeleteDepartment = (department: Department) => {
    setDepartmentToDelete(department)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!departmentToDelete) return

    try {
      await deleteMutation.mutateAsync(departmentToDelete.id)
      setIsDeleteDialogOpen(false)
      setDepartmentToDelete(null)
    } catch (error) {
      // Error is handled by the mutation hook
    }
  }

  const getStatusBadge = (status: Status) => {
    return (
      <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
        {status}
      </Badge>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorAlert 
          title="Failed to load departments"
          message={error.message}
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage organizational departments and their configurations
          </p>
        </div>
        <Button onClick={handleCreateDepartment} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Statistics */}
      <DepartmentStats stats={stats} isLoading={statsLoading} />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search departments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Status | "ALL")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
          <CardContent>
            <DepartmentFilters
              onFiltersChange={(filters) => {
                // Handle additional filters if needed
              }}
            />
          </CardContent>
        )}
      </Card>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Departments ({filteredDepartments.length})
          </CardTitle>
          <CardDescription>
            A list of all departments in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDepartments.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No departments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "ALL" 
                  ? "No departments match your current filters."
                  : "Get started by creating your first department."
                }
              </p>
              {(!searchQuery && statusFilter === "ALL") && (
                <Button onClick={handleCreateDepartment} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Department
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">
                      {department.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {department.description || "No description"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(department.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDepartment(department)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditDepartment(department)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteDepartment(department)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <DepartmentForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      <DepartmentForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        department={selectedDepartment}
      />

      <DepartmentDetail
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        department={selectedDepartment}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the department "{departmentToDelete?.name}". 
              This action cannot be undone and may fail if the department has associated positions or employees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
