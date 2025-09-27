"use client"
import React from "react"
import { Building2, Calendar, FileText, Users, MapPin, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Department, Status } from "@/lib/api/types"
import { format } from "date-fns"

interface DepartmentDetailProps {
  isOpen: boolean
  onClose: () => void
  department: Department | null
  onEdit?: (department: Department) => void
  onDelete?: (department: Department) => void
}

export const DepartmentDetail: React.FC<DepartmentDetailProps> = ({
  isOpen,
  onClose,
  department,
  onEdit,
  onDelete
}) => {
  if (!department) return null

  const getStatusBadge = (status: Status) => {
    return (
      <Badge 
        variant={status === "ACTIVE" ? "default" : "secondary"}
        className="ml-2"
      >
        {status}
      </Badge>
    )
  }

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString
      return format(date, "PPP 'at' p")
    } catch {
      return "Unknown"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this department
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {department.name}
                </span>
                {getStatusBadge(department.status)}
              </CardTitle>
              {department.description && (
                <CardDescription className="text-base">
                  {department.description}
                </CardDescription>
              )}
            </CardHeader>
          </Card>

          {/* Department Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Department Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Department ID
                  </div>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {department.id}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Status
                  </div>
                  <div>
                    {getStatusBadge(department.status)}
                  </div>
                </div>
              </div>

              {department.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Description
                  </div>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {department.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Deletion Status
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={department.isDeleted ? "destructive" : "default"}>
                      {department.isDeleted ? "Deleted" : "Active"}
                    </Badge>
                    {department.isDeleted && (
                      <span className="text-sm text-muted-foreground">
                        This department has been soft-deleted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Information</CardTitle>
              <CardDescription>
                Information about positions and employees in this department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Positions and employees data would be loaded here</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Position and employee counts would be displayed here 
                  when integrated with the respective APIs. This information helps determine 
                  if the department can be safely deleted.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Department ID: {department.id}
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={() => onEdit(department)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              {onDelete && !department.isDeleted && (
                <Button
                  variant="destructive"
                  onClick={() => onDelete(department)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
