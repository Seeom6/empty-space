"use client"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Building2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useCreateDepartment, useUpdateDepartment, useDepartmentNameExists } from "@/lib/api/hooks/useDepartment"
import { Department, Status } from "@/lib/api/types"

// Form validation schema
const departmentSchema = z.object({
  name: z
    .string()
    .min(3, "Department name must be at least 3 characters")
    .max(255, "Department name must not exceed 255 characters")
    .trim(),
  description: z
    .string()
    .transform(val => val === "" ? undefined : val)
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
})

type DepartmentFormData = z.infer<typeof departmentSchema>

interface DepartmentFormProps {
  isOpen: boolean
  onClose: () => void
  mode: "create" | "edit"
  department?: Department | null
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  isOpen,
  onClose,
  mode,
  department
}) => {
  // Form setup
  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE",
    },
  })

  const { watch, setValue, reset } = form
  const watchedName = watch("name")

  // API hooks
  const createMutation = useCreateDepartment()
  const updateMutation = useUpdateDepartment()
  
  // Check if name exists (for validation)
  const { data: nameExists } = useDepartmentNameExists(
    watchedName,
    mode === "edit" ? department?.id : undefined
  )

  // Reset form when modal opens/closes or department changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && department) {
        reset({
          name: department.name,
          description: department.description || "",
          status: department.status,
        })
      } else {
        reset({
          name: "",
          description: "",
          status: "ACTIVE",
        })
      }
    }
  }, [isOpen, mode, department, reset])

  // Handle form submission
  const onSubmit = async (data: DepartmentFormData) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          name: data.name,
          description: data.description,
          status: data.status,
        })
      } else if (mode === "edit" && department) {
        await updateMutation.mutateAsync({
          id: department.id,
          data: {
            name: data.name,
            description: data.description,
            status: data.status,
          },
        })
      }
      
      handleClose()
    } catch (error) {
      // Error handling is done by the mutation hooks
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {mode === "create" ? "Create Department" : "Edit Department"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Add a new department to your organization."
              : "Update the department information."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Department Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Engineering, Marketing, HR"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    The name must be unique and between 3-255 characters.
                  </FormDescription>
                  <FormMessage />
                  {nameExists && watchedName.length >= 3 && (
                    <p className="text-sm text-destructive">
                      A department with this name already exists.
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the department's role and responsibilities..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description to help identify the department's purpose.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Active departments are available for use throughout the system.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || (nameExists && watchedName.length >= 3)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Create Department" : "Update Department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
