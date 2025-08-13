import { PayrollEntry, PayrollBonus, PayrollDeduction, BonusType, DeductionType } from './types'

// Seeded random function for consistent results
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Helper function to generate deterministic bonuses
const generateBonuses = (employeeIndex: number): PayrollBonus[] => {
  const bonuses: PayrollBonus[] = []
  const bonusCount = Math.floor(seededRandom(employeeIndex * 100) * 3) // 0-2 bonuses

  const bonusTemplates = [
    { type: 'Performance Bonus' as BonusType, amount: 1000, description: 'Monthly performance bonus' },
    { type: 'Overtime' as BonusType, amount: 500, description: 'Overtime compensation' },
    { type: 'Project Completion' as BonusType, amount: 2000, description: 'Project milestone bonus' },
    { type: 'Holiday Bonus' as BonusType, amount: 800, description: 'Holiday season bonus' }
  ]

  for (let i = 0; i < bonusCount; i++) {
    const template = bonusTemplates[Math.floor(seededRandom(employeeIndex * 100 + i) * bonusTemplates.length)]
    bonuses.push({
      id: `bonus-${employeeIndex}-${i}`,
      type: template.type,
      amount: template.amount + Math.floor(seededRandom(employeeIndex * 100 + i + 10) * 500),
      description: template.description,
      date: '2024-12-01'
    })
  }

  return bonuses
}

// Helper function to generate deterministic deductions
const generateDeductions = (baseSalary: number, employeeIndex: number): PayrollDeduction[] => {
  const deductions: PayrollDeduction[] = []

  // Standard deductions based on salary
  deductions.push(
    {
      id: `ded-tax-${employeeIndex}`,
      type: 'Income Tax' as DeductionType,
      amount: Math.round(baseSalary * 0.18), // 18% tax
      description: 'Federal income tax',
      date: '2024-12-01'
    },
    {
      id: `ded-ss-${employeeIndex}`,
      type: 'Social Security' as DeductionType,
      amount: Math.round(baseSalary * 0.062), // 6.2% social security
      description: 'Social Security contribution',
      date: '2024-12-01'
    },
    {
      id: `ded-health-${employeeIndex}`,
      type: 'Health Insurance' as DeductionType,
      amount: 450,
      description: 'Monthly health insurance premium',
      date: '2024-12-01'
    }
  )

  // Deterministically add additional deductions
  if (seededRandom(employeeIndex * 200) < 0.3) {
    deductions.push({
      id: `ded-retirement-${employeeIndex}`,
      type: 'Retirement Fund' as DeductionType,
      amount: Math.round(baseSalary * 0.05), // 5% retirement
      description: '401(k) contribution',
      date: '2024-12-01'
    })
  }

  return deductions
}

// Mock employee salary data
const employeeBaseSalaries = [
  { id: 'emp-1', name: 'John Doe', department: 'Engineering', baseSalary: 8500 },
  { id: 'emp-2', name: 'Jane Smith', department: 'Engineering', baseSalary: 11000 },
  { id: 'emp-3', name: 'Mike Johnson', department: 'Design', baseSalary: 7200 },
  { id: 'emp-4', name: 'Sarah Wilson', department: 'Design', baseSalary: 9500 },
  { id: 'emp-5', name: 'David Brown', department: 'Marketing', baseSalary: 6800 },
  { id: 'emp-6', name: 'Lisa Garcia', department: 'Marketing', baseSalary: 8800 },
  { id: 'emp-7', name: 'Alex Chen', department: 'Engineering', baseSalary: 7800 },
  { id: 'emp-8', name: 'Emma Davis', department: 'HR', baseSalary: 6500 }
]

// Helper function to get month number
const getMonthNumber = (monthName: string): number => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months.indexOf(monthName)
}

// Generate payroll entries for last 6 months
const generatePayrollEntries = (): PayrollEntry[] => {
  const entries: PayrollEntry[] = []
  const months = [
    { month: 'December', year: 2024 },
    { month: 'November', year: 2024 },
    { month: 'October', year: 2024 },
    { month: 'September', year: 2024 },
    { month: 'August', year: 2024 },
    { month: 'July', year: 2024 }
  ]
  
  months.forEach(({ month, year }) => {
    employeeBaseSalaries.forEach((employee, employeeIndex) => {
      const bonuses = generateBonuses(employeeIndex)
      const deductions = generateDeductions(employee.baseSalary, employeeIndex)
      
      const totalBonuses = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0)
      const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0)
      const grossSalary = employee.baseSalary + totalBonuses
      const netSalary = grossSalary - totalDeductions
      
      // Determine status based on month (deterministic)
      let status: 'Paid' | 'Pending' | 'Processing' | 'Failed'
      if (month === 'December') {
        status = seededRandom(employeeIndex * 700) < 0.8 ? 'Pending' : 'Processing'
      } else {
        status = seededRandom(employeeIndex * 800) < 0.95 ? 'Paid' : 'Failed'
      }
      
      // Generate pay date (usually end of month)
      const payDate = month === 'December' 
        ? '2024-12-31' 
        : new Date(year, getMonthNumber(month), 0).toISOString().split('T')[0]
      
      const entry: PayrollEntry = {
        id: `payroll-${employee.id}-${month}-${year}`,
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        month,
        year,
        baseSalary: employee.baseSalary,
        bonuses,
        deductions,
        grossSalary,
        netSalary,
        payDate,
        status,
        payslipGenerated: status === 'Paid',
        notes: status === 'Failed' ? 'Payment processing error - bank details invalid' : undefined
      }
      
      entries.push(entry)
    })
  })
  
  return entries
}

export const mockPayrollEntries = generatePayrollEntries()