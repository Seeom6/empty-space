import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { PayrollEntry, PayrollBonus, PayrollDeduction, BonusType, DeductionType, PayrollStatus } from './types'
import { BONUS_TYPES, DEDUCTION_TYPES } from './constants'

interface CreateEditPayrollModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payrollEntry: Partial<PayrollEntry>) => void
  entry?: PayrollEntry
  employees: Array<{ id: string; name: string; department: string; baseSalary?: number }>
}

interface PayrollForm {
  employeeId: string
  employeeName: string
  department: string
  month: string
  year: string
  baseSalary: string
  bonuses: PayrollBonus[]
  deductions: PayrollDeduction[]
  payDate: string
  status: PayrollStatus
  notes: string
}

export function CreateEditPayrollModal({ 
  isOpen, 
  onClose, 
  onSave, 
  entry, 
  employees 
}: CreateEditPayrollModalProps) {
  const [form, setForm] = useState<PayrollForm>({
    employeeId: '',
    employeeName: '',
    department: '',
    month: 'December',
    year: '2024',
    baseSalary: '',
    bonuses: [],
    deductions: [],
    payDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    notes: ''
  })

  const [newBonus, setNewBonus] = useState({
    type: '',
    amount: '',
    description: ''
  })

  const [newDeduction, setNewDeduction] = useState({
    type: '',
    amount: '',
    description: ''
  })

  const isEditing = !!entry

  useEffect(() => {
    if (entry) {
      setForm({
        employeeId: entry.employeeId,
        employeeName: entry.employeeName,
        department: entry.department,
        month: entry.month,
        year: entry.year.toString(),
        baseSalary: entry.baseSalary.toString(),
        bonuses: [...entry.bonuses],
        deductions: [...entry.deductions],
        payDate: entry.payDate,
        status: entry.status,
        notes: entry.notes || ''
      })
    } else {
      // Reset form for new entry
      setForm({
        employeeId: '',
        employeeName: '',
        department: '',
        month: 'December',
        year: '2024',
        baseSalary: '',
        bonuses: [],
        deductions: [],
        payDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        notes: ''
      })
    }
  }, [entry])

  const handleEmployeeSelect = (employeeId: string) => {
    const selectedEmployee = employees.find(emp => emp.id === employeeId)
    if (selectedEmployee) {
      setForm({
        ...form,
        employeeId,
        employeeName: selectedEmployee.name,
        department: selectedEmployee.department,
        baseSalary: selectedEmployee.baseSalary?.toString() || ''
      })
      
      // Add standard deductions if it's a new entry
      if (!isEditing) {
        const baseSalary = selectedEmployee.baseSalary || 0
        const standardDeductions: PayrollDeduction[] = [
          {
            id: `ded-tax-${Date.now()}`,
            type: 'Income Tax' as DeductionType,
            amount: Math.round(baseSalary * 0.18),
            description: 'Federal income tax',
            date: new Date().toISOString().split('T')[0]
          },
          {
            id: `ded-ss-${Date.now()}`,
            type: 'Social Security' as DeductionType,
            amount: Math.round(baseSalary * 0.062),
            description: 'Social Security contribution',
            date: new Date().toISOString().split('T')[0]
          },
          {
            id: `ded-health-${Date.now()}`,
            type: 'Health Insurance' as DeductionType,
            amount: 450,
            description: 'Monthly health insurance premium',
            date: new Date().toISOString().split('T')[0]
          }
        ]
        setForm(prev => ({ ...prev, deductions: standardDeductions }))
      }
    }
  }

  const addBonus = () => {
    if (newBonus.type && newBonus.amount) {
      const bonus: PayrollBonus = {
        id: `bonus-${Date.now()}`,
        type: newBonus.type as BonusType,
        amount: parseFloat(newBonus.amount),
        description: newBonus.description || newBonus.type,
        date: new Date().toISOString().split('T')[0]
      }
      setForm({ ...form, bonuses: [...form.bonuses, bonus] })
      setNewBonus({ type: '', amount: '', description: '' })
    }
  }

  const removeBonus = (bonusId: string) => {
    setForm({ ...form, bonuses: form.bonuses.filter(b => b.id !== bonusId) })
  }

  const addDeduction = () => {
    if (newDeduction.type && newDeduction.amount) {
      const deduction: PayrollDeduction = {
        id: `ded-${Date.now()}`,
        type: newDeduction.type as DeductionType,
        amount: parseFloat(newDeduction.amount),
        description: newDeduction.description || newDeduction.type,
        date: new Date().toISOString().split('T')[0]
      }
      setForm({ ...form, deductions: [...form.deductions, deduction] })
      setNewDeduction({ type: '', amount: '', description: '' })
    }
  }

  const removeDeduction = (deductionId: string) => {
    setForm({ ...form, deductions: form.deductions.filter(d => d.id !== deductionId) })
  }

  const calculateTotals = () => {
    const baseSalary = parseFloat(form.baseSalary) || 0
    const totalBonuses = form.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0)
    const totalDeductions = form.deductions.reduce((sum, deduction) => sum + deduction.amount, 0)
    const grossSalary = baseSalary + totalBonuses
    const netSalary = grossSalary - totalDeductions

    return {
      baseSalary,
      totalBonuses,
      totalDeductions,
      grossSalary,
      netSalary
    }
  }

  const totals = calculateTotals()

  const handleSubmit = () => {
    const payrollData: Partial<PayrollEntry> = {
      ...entry,
      employeeId: form.employeeId,
      employeeName: form.employeeName,
      department: form.department,
      month: form.month,
      year: parseInt(form.year),
      baseSalary: totals.baseSalary,
      bonuses: form.bonuses,
      deductions: form.deductions,
      grossSalary: totals.grossSalary,
      netSalary: totals.netSalary,
      payDate: form.payDate,
      status: form.status,
      payslipGenerated: form.status === 'Paid',
      notes: form.notes || undefined
    }

    if (!isEditing) {
      payrollData.id = `payroll-${form.employeeId}-${form.month}-${form.year}`
    }

    onSave(payrollData)
    onClose()
  }

  const isFormValid = () => {
    return form.employeeId && form.baseSalary && form.month && form.year && form.payDate
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Payroll Entry' : 'Process Payroll'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update payroll information for the selected period.' : 'Create a new payroll entry for an employee.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Employee Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee *</Label>
                  <Select 
                    value={form.employeeId} 
                    onValueChange={handleEmployeeSelect}
                    disabled={isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={form.department}
                    disabled
                    placeholder="Department will be auto-filled"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Month *</Label>
                  <Select value={form.month} onValueChange={(value) => setForm({ ...form, month: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Select value={form.year} onValueChange={(value) => setForm({ ...form, year: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseSalary">Base Salary ($) *</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={form.baseSalary}
                    onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                    placeholder="Enter base salary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bonuses Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Bonuses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Bonus */}
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                <h4 className="font-medium mb-3">Add Bonus</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Select value={newBonus.type} onValueChange={(value) => setNewBonus({ ...newBonus, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Bonus Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BONUS_TYPES.map((type: string) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={newBonus.amount}
                    onChange={(e) => setNewBonus({ ...newBonus, amount: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newBonus.description}
                    onChange={(e) => setNewBonus({ ...newBonus, description: e.target.value })}
                  />
                  <Button onClick={addBonus} size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Existing Bonuses */}
              <div className="space-y-2">
                {form.bonuses.map(bonus => (
                  <div key={bonus.id} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-medium">{bonus.type}</div>
                      <div className="text-sm text-muted-foreground">{bonus.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">
                        +{formatCurrency(bonus.amount)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeBonus(bonus.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {form.bonuses.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No bonuses added</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deductions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Deductions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Deduction */}
              <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950">
                <h4 className="font-medium mb-3">Add Deduction</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Select value={newDeduction.type} onValueChange={(value) => setNewDeduction({ ...newDeduction, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Deduction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEDUCTION_TYPES.map((type: string) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={newDeduction.amount}
                    onChange={(e) => setNewDeduction({ ...newDeduction, amount: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newDeduction.description}
                    onChange={(e) => setNewDeduction({ ...newDeduction, description: e.target.value })}
                  />
                  <Button onClick={addDeduction} size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Existing Deductions */}
              <div className="space-y-2">
                {form.deductions.map(deduction => (
                  <div key={deduction.id} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-medium">{deduction.type}</div>
                      <div className="text-sm text-muted-foreground">{deduction.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-red-600">
                        -{formatCurrency(deduction.amount)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeDeduction(deduction.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Salary Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Salary Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Base Salary</span>
                  <span className="font-medium">{formatCurrency(totals.baseSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Bonuses</span>
                  <span className="font-medium text-green-600">+{formatCurrency(totals.totalBonuses)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Salary</span>
                  <span className="font-medium">{formatCurrency(totals.grossSalary)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Total Deductions</span>
                  <span className="font-medium text-red-600">-{formatCurrency(totals.totalDeductions)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold text-lg">Net Salary</span>
                  <span className="font-bold text-lg text-primary">{formatCurrency(totals.netSalary)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payDate">Pay Date *</Label>
                  <Input
                    id="payDate"
                    type="date"
                    value={form.payDate}
                    onChange={(e) => setForm({ ...form, payDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(value: any) => setForm({ ...form, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid()}>
            {isEditing ? 'Update Payroll' : 'Process Payroll'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}