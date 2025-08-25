import React, { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Eye, Edit, Trash2, CheckCircle, Play, FileText, DollarSign, Calendar, User } from 'lucide-react'
import { PayrollEntry } from '../types'
import { 
  getPayrollStatusBadgeVariant, 
  formatCurrency, 
  formatDate, 
  canEditPayroll, 
  canProcessPayroll,
  canApprovePayroll,
  canManagePayroll
} from '../utils'

interface PayrollCardProps {
  entry: PayrollEntry
  userRole: string
  onView?: (entry: PayrollEntry) => void
  onEdit?: (entry: PayrollEntry) => void
  onDelete?: (entryId: string) => void
  onApprove?: (entryId: string) => void
  onProcess?: (entryId: string) => void
  onGeneratePayslip?: (entryId: string) => void
  className?: string
}

export const PayrollCard = memo<PayrollCardProps>(({
  entry,
  userRole,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onProcess,
  onGeneratePayslip,
  className = ''
}) => {
  const canEdit = canEditPayroll(entry) && canManagePayroll(userRole)
  const canDelete = canManagePayroll(userRole) && entry.status !== 'Paid'
  const canApprove = entry.status === 'Pending' && canApprovePayroll(userRole)
  const canProcessPayment = canProcessPayroll(entry) && canManagePayroll(userRole)
  const statusVariant = getPayrollStatusBadgeVariant(entry.status)

  const handleCardClick = () => {
    onView?.(entry)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(entry)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(entry.id)
  }

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onApprove?.(entry.id)
  }

  const handleProcess = (e: React.MouseEvent) => {
    e.stopPropagation()
    onProcess?.(entry.id)
  }

  const handleGeneratePayslip = (e: React.MouseEvent) => {
    e.stopPropagation()
    onGeneratePayslip?.(entry.id)
  }

  const getStatusBorderClass = () => {
    switch (entry.status) {
      case 'Paid': return 'border-l-green-500'
      case 'Pending': return 'border-l-yellow-500'
      case 'Processing': return 'border-l-blue-500'
      case 'Failed': return 'border-l-red-500'
      default: return 'border-l-gray-500'
    }
  }

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${getStatusBorderClass()} ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-2xl flex-shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate" title={entry.employeeName}>
                {entry.employeeName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {entry.department}
                </Badge>
                <Badge variant={statusVariant} className="text-xs">
                  {entry.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCardClick}
              className="h-8 w-8 p-0"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {canEdit && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
                title="Edit payroll"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {!entry.payslipGenerated && onGeneratePayslip && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGeneratePayslip}
                className="h-8 w-8 p-0"
                title="Generate payslip"
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
            
            {canApprove && onApprove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleApprove}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-600"
                title="Approve payroll"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            
            {canProcessPayment && onProcess && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProcess}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-600"
                title="Process payment"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            
            {canDelete && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Delete payroll"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Payroll Entry</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the payroll entry for {entry.employeeName} ({entry.month} {entry.year})? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{formatCurrency(entry.netSalary)}</p>
                <p className="text-xs text-muted-foreground">Net Salary</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{entry.month} {entry.year}</p>
                <p className="text-xs text-muted-foreground">Period</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Base: {formatCurrency(entry.baseSalary)}</span>
            <span>Gross: {formatCurrency(entry.grossSalary)}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{entry.bonuses.length} bonuses</span>
            <span>{entry.deductions.length} deductions</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <div>Pay Date: {formatDate(entry.payDate)}</div>
            {entry.payslipGenerated && (
              <div className="text-green-600 mt-1">✓ Payslip Generated</div>
            )}
          </div>
          
          {entry.notes && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <strong>Notes:</strong> {entry.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

PayrollCard.displayName = 'PayrollCard'
