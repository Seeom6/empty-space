
# Enterprise Employee & Technology Management System

## Overview
This documentation describes the complete architecture for the Employee Management, Technology Management, Project Management, and Task Management systems. It includes schemas, relationships, permissions, and responsibilities.

---

## 1. Employee Management System

### **Purpose**
Manage employee data, roles, departments, salaries, attendance, and more.

### **Schema: Employee**
```typescript
@Schema({ timestamps: true })
export class Employee {
  @Prop({ type: Types.ObjectId, ref: 'User' }) userId?: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true }) firstName: string;
  @Prop({ type: String, required: true, trim: true }) lastName: string;
  @Prop({ type: String, enum: Gender }) gender?: Gender;
  @Prop({ type: Date }) birthDate?: Date;

  @Prop({ type: String, required: true, unique: true, trim: true }) employeeId: string;
  @Prop({ type: String, required: true, trim: true }) position: string;
  @Prop({ type: [Types.ObjectId], ref: 'Technology', default: [] }) technologies: Types.ObjectId[];

  @Prop({ type: String, enum: EmployeeDepartment, required: true }) department: EmployeeDepartment;
  @Prop({ type: String, enum: EmploymentType }) employmentType: EmploymentType;
  @Prop({ type: String, enum: EmployeeStatus }) status: EmployeeStatus;

  @Prop({ type: [PerformanceReviewSchema], default: [] }) performanceReviews: PerformanceReview[];
  @Prop({ type: [EmployeeProjectSchema], default: [] }) projects: EmployeeProject[];
}
```

### **Indexes**
- `employeeId` (unique)
- `email` (unique)
- `department, status`
- Full-text: `firstName, lastName, email, position, skills`

### **Permissions**
- **Admin:** Full access (Create, Update, Delete, Assign roles)
- **HR:** Create and Update Employees, manage salaries
- **Manager:** Can view and assign tasks to employees in their team
- **Employee:** View own profile and attendance

---

## 2. Technology Management System

### **Purpose**
Manage all technologies used by employees and projects.

### **Schema: Technology**
```typescript
@Schema({ timestamps: true })
export class Technology {
  @Prop({ type: String, required: true, unique: true, trim: true }) name: string;
  @Prop({ type: String, required: true, trim: true }) category: string;
  @Prop({ type: String, trim: true }) description?: string;
  @Prop({ type: String, enum: ['active', 'inactive', 'duplicated'], default: 'active' }) status: string;
  @Prop({ type: String }) iconUrl?: string;
  @Prop({ type: String }) documentationUrl?: string;
  @Prop({ type: String }) version?: string;
}
```

### **Indexes**
- `name` (unique)
- `category`
- `status`

### **Permissions**
- **Admin & HR:** Create, Update, Delete technologies
- **Employee:** View technologies only

---

## 3. Project Management System

### **Purpose**
Create and manage projects, assign employees and technologies.

### **Schema: Project**
```typescript
@Schema({ timestamps: true })
export class Project {
  @Prop({ type: String, required: true, trim: true }) name: string;
  @Prop({ type: String }) description?: string;
  @Prop({ type: String, enum: ['active', 'completed', 'on_hold'], default: 'active' }) status: string;
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true }) managerId: Types.ObjectId;
  @Prop({ type: [Types.ObjectId], ref: 'Employee', default: [] }) teamMembers: Types.ObjectId[];
  @Prop({ type: [Types.ObjectId], ref: 'Technology', default: [] }) technologies: Types.ObjectId[];
  @Prop({ type: Date, required: true }) startDate: Date;
  @Prop({ type: Date }) endDate?: Date;
}
```

### **Indexes**
- `name`
- `status`
- `managerId`

### **Permissions**
- **Admin:** Full control
- **Manager:** Create projects, assign team members and tasks
- **Employee:** View assigned projects

---

## 4. Task Management System

### **Purpose**
Manage tasks within projects, assign to employees.

### **Schema: Task**
```typescript
@Schema({ timestamps: true })
export class Task {
  @Prop({ type: String, required: true, trim: true }) title: string;
  @Prop({ type: String }) description?: string;
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true }) projectId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true }) assignedTo: Types.ObjectId;
  @Prop({ type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' }) status: string;
  @Prop({ type: Date }) dueDate?: Date;
}
```

### **Indexes**
- `projectId`
- `assignedTo`
- `status`

### **Permissions**
- **Admin:** Full control
- **Manager:** Create and assign tasks to team members
- **Employee:** View and update own tasks

---

## 5. Attendance Management System

### **Purpose**
Track employee attendance and working hours.

### **Schema: Attendance**
```typescript
@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true }) employeeId: Types.ObjectId;
  @Prop({ type: Date, required: true }) date: Date;
  @Prop({ type: Date }) checkInTime?: Date;
  @Prop({ type: Date }) checkOutTime?: Date;
  @Prop({ type: Number, default: 0 }) totalHours?: number;
}
```

### **Indexes**
- `employeeId`
- `date`

### **Permissions**
- **Employee:** Can check in and check out
- **Manager:** Can view team attendance
- **Admin & HR:** Full access
```

---

## **Relationships**
- **Employee ↔ Technology** (Many-to-Many)
- **Employee ↔ Project** (Many-to-Many)
- **Project ↔ Task** (One-to-Many)
- **Employee ↔ Attendance** (One-to-Many)

---

## **Dashboard Features for Admin**
- Total Employees, Projects, Tasks
- Active vs Inactive Employees
- Attendance Summary
- Technology Usage Analytics
- Project Progress Chart
