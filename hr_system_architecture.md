# HR & Employee Management System Documentation

## 1. System Overview
This documentation describes the modular structure of the HR and Employee Management System, its schemas, relationships, and permissions. The system is designed to be modular, scalable, and microservices-ready.

---

## 2. Modules

### **2.1 Employee Management System**
**Purpose:** Manage employee profiles, personal details, positions, departments, and employment details.

#### **Schema (Employee)**
- **userId**: ObjectId (ref: User)
- **firstName**, **lastName**, **fullName**
- **gender**, **birthDate**, **maritalStatus**
- **email**, **phone**
- **address** (country, city, street, postalCode)
- **employeeId** (unique)
- **position**, **jobTitle**
- **department**: ENUM (ENGINEERING, HR, etc.)
- **employmentType**: ENUM (FULL_TIME, PART_TIME, etc.)
- **status**: ENUM (ACTIVE, INACTIVE, TERMINATED)
- **hireDate**, **startDate**, **endDate**
- **managerId**: ObjectId (ref: Employee)
- **salaryDetails** (amount, currency)
- **bonuses[]**, **deductions[]**
- **technologies[]**: ObjectId[] (ref: Technology)
- **performanceReviews[]**, **projects[]**, **trainings[]**
- **attendanceSummary**

#### **Core Functions**
- Create Employee (Admin, HR only)
- Update Employee details (Admin, HR)
- Assign Manager (Admin, HR)
- Assign Technologies (Admin, HR, Manager)
- View Employee Profile (Admin, HR, Manager, Self)
- Soft Delete Employee (Admin only)

#### **Permissions**
- **Admin**: Full CRUD
- **HR**: Full CRUD except delete user permanently
- **Manager**: View & update assigned employees
- **Employee**: View own profile

---

### **2.2 Attendance & Time Tracking System**
**Purpose:** Manage daily attendance, track working hours, late arrivals, and overtime.

#### **Schema (Attendance)**
- **employeeId**: ObjectId (ref: Employee)
- **date**: Date
- **checkInTime**: Date
- **checkOutTime**: Date
- **hoursWorked**: Number
- **status**: ENUM (Present, Absent, Late)

#### **Core Functions**
- Check-In (Employee)
- Check-Out (Employee)
- Calculate Hours Worked (Auto)
- Track Overtime & Lateness (Auto)

#### **Permissions**
- **Employee**: Check-in/out for self
- **HR/Admin**: View all attendance logs
- **Manager**: View team attendance

---

### **2.3 Payroll & Compensation System**
**Purpose:** Manage salary, bonuses, deductions, and generate payroll.

#### **Schema (Payroll)**
- **employeeId**: ObjectId (ref: Employee)
- **baseSalary**: Number
- **bonuses[]**: {amount, type, date}
- **deductions[]**: {amount, type, date}
- **netSalary**: Number
- **payDate**: Date

#### **Core Functions**
- Calculate Net Salary
- Add Bonus/Deduction
- Generate Payslip

#### **Permissions**
- **Admin/HR**: Full access
- **Employee**: View own payroll

---

### **2.4 Performance Management System**
**Purpose:** Track performance reviews, goals, and ratings.

#### **Schema (PerformanceReview)**
- **employeeId**: ObjectId
- **evaluatorId**: ObjectId (ref: Employee)
- **date**: Date
- **rating**: Number (1-5)
- **goals[]**, **achievements[]**
- **feedback**, **improvementAreas**

#### **Core Functions**
- Add Review (Manager, HR)
- View Reviews (Employee, HR, Manager)

#### **Permissions**
- **HR/Admin**: Full CRUD
- **Manager**: Create reviews for team
- **Employee**: View own reviews

---

### **2.5 Training & Certification System**
**Purpose:** Manage employee training records, certifications, and skill development.

#### **Schema (Training)**
- **title**, **provider**
- **completionDate**, **expiryDate**
- **skillsGained[]**
- **certificateUrl**, **certificateNumber**

#### **Core Functions**
- Add Training Record (HR, Manager)
- Upload Certification
- Verify Certifications

#### **Permissions**
- **HR/Admin**: Full CRUD
- **Manager**: Assign training
- **Employee**: View & upload certifications

---

### **2.6 Project Management System**
**Purpose:** Assign projects and track employee roles and contributions.

#### **Schema (EmployeeProject)**
- **projectName**, **projectId** (optional)
- **projectTechnologies[]**
- **role**, **startDate**, **endDate**
- **responsibilities[]**, **outcomes**

#### **Core Functions**
- Assign Project to Employee
- Track Contribution %

#### **Permissions**
- **Admin/HR**: Full CRUD
- **Manager**: Assign projects to team
- **Employee**: View own projects

---

### **2.7 Disciplinary & Compliance System**
**Purpose:** Manage disciplinary actions, warnings, and compliance issues.

#### **Schema (DisciplinaryAction)**
- **employeeId**: ObjectId
- **reason**, **actionTaken**
- **severity**: ENUM (Warning, Suspension, Termination)
- **issuedBy**: ObjectId
- **isResolved**, **resolvedDate**

#### **Core Functions**
- Issue Warning
- Mark as Resolved

#### **Permissions**
- **HR/Admin**: Full CRUD
- **Manager**: Report issues

---

## 3. Relationships Between Modules
- **Employee** ↔ **Attendance**: One-to-Many (Employee has many attendance logs)
- **Employee** ↔ **Payroll**: One-to-One
- **Employee** ↔ **PerformanceReview**: One-to-Many
- **Employee** ↔ **Project**: One-to-Many
- **Employee** ↔ **Training**: One-to-Many
- **Employee** ↔ **DisciplinaryAction**: One-to-Many

## 4. Roles & Permissions Overview
| Role       | Employee Mgmt | Attendance | Payroll | Performance | Training | Projects | Disciplinary |
|-----------|---------------|-----------|--------|------------|---------|---------|-------------|
| **Admin** | Full CRUD     | View All  | Full   | Full       | Full    | Full    | Full        |
| **HR**    | Full CRUD     | View All  | Full   | Full       | Full    | Full    | Full        |
| **Manager**| View & Assign | Team Only | None   | Team Only  | Assign  | Assign  | Report      |
| **Employee**| View Self    | Self      | View   | View       | View    | View    | None        |

## 5. APIs and Core Functionalities
- **Employee API**: `/api/employees` (CRUD)
- **Attendance API**: `/api/attendance` (check-in/out)
- **Payroll API**: `/api/payroll` (calculate salary)
- **Performance API**: `/api/performance` (reviews)
- **Training API**: `/api/training` (assign, upload)
- **Project API**: `/api/projects` (assign)
- **Disciplinary API**: `/api/disciplinary` (warnings)

---

### ✅ Next Step:
Generate architectural diagrams for relationships and workflows.

