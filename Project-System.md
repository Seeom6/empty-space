
# Project Management System

This document describes the **Project Management System** as part of the overall HR & Task Management ecosystem. It defines the **schema**, **relationships**, **operations**, **roles & permissions**, and **analytics** related to projects.

---

## 1. System Overview

The Project Management System is designed to handle:
- Project creation, updates, and deletion.
- Assigning project managers and team members.
- Linking tasks to projects.
- Managing technologies and resources.
- Tracking project progress, status, deadlines, and budgets.

---

## 2. Data Schema (Mongoose)

### **Project Schema**
```typescript
@Schema({ timestamps: true })
export class Project {
  @Prop({ type: String, required: true, trim: true, minlength: 2, maxlength: 200 })
  name: string;

  @Prop({ type: String, trim: true, maxlength: 2000 })
  description?: string;

  @Prop({ type: String, enum: ProjectStatus, default: ProjectStatus.PLANNING })
  status: ProjectStatus;

  @Prop({ type: String, enum: ProjectPriority, default: ProjectPriority.MEDIUM })
  priority: ProjectPriority;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: Date })
  deadline?: Date;

  @Prop({ type: Number, min: 0, max: 100, default: 0 })
  progress: number;

  @Prop({ type: Number, min: 0 })
  budget?: number;

  @Prop({ type: String, default: 'USD' })
  currency: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  projectManager: Types.ObjectId;

  @Prop({ type: [ProjectMember], default: [] })
  members: ProjectMember[];

  @Prop({ type: [Types.ObjectId], ref: 'Technology', default: [] })
  technologies: Types.ObjectId[];

  @Prop({ type: [ProjectTask], default: [] })
  tasks: ProjectTask[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}
```

---

### **ProjectTask Sub-schema**
```typescript
@Schema({ _id: false })
export class ProjectTask {
  @Prop({ type: String, required: true, trim: true, minlength: 2, maxlength: 200 })
  name: string;

  @Prop({ type: String, trim: true, maxlength: 1000 })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignee?: Types.ObjectId;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Prop({ type: Number, min: 0, max: 100, default: 0 })
  progress: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}
```

---

### **ProjectMember Sub-schema**
```typescript
@Schema({ _id: false })
export class ProjectMember {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  role: string;

  @Prop({ type: Date, default: Date.now })
  joinedAt: Date;
}
```

---

## 3. Relationships

- **Project ↔ Tasks**: Each project contains multiple tasks.  
- **Project ↔ Team Members**: Projects have assigned members with roles like *Project Manager*, *Team Lead*, *Developer*, etc.  
- **Project ↔ Technologies**: Projects can have associated technologies.  
- **Project ↔ Employee**: Each member is an employee/user in the system.

---

## 4. Roles & Permissions

| Role              | Permissions                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **Admin**          | Full CRUD on projects, tasks, and members.                                 |
| **HR**             | Can view all projects, cannot edit project details.                        |
| **Project Manager**| Create/edit/delete projects they own, manage members, assign tasks.        |
| **Team Lead**      | Can create tasks, assign to members, update progress, cannot delete project|
| **Employee**       | Can view projects they are assigned to, update their own task status.      |

---

## 5. Operations

- **Create Project** (Admin, Project Manager)
- **Update Project Details** (Admin, Project Manager)
- **Delete Project** (Admin only)
- **Add/Remove Members** (Admin, Project Manager)
- **Assign Roles in Project** (Admin, Project Manager)
- **Track Progress** (All roles depending on task ownership)
- **View Project Analytics** (Admin, Project Manager, Team Lead)

---

## 6. Analytics & Reports

- **Projects by Status** (Planning, In Progress, Completed)
- **Project Progress Tracking** (Gantt chart, percentage completion)
- **Budget vs Actual** (for Admin & PM)
- **Top Performing Projects**
- **Tasks Distribution per Project**
- **Overdue Tasks per Project**
- **Member Workload Analysis**

---

## 7. Indexes & Validation Rules

- **Indexes**
    - `{ name: 1 }` (for fast project search)
    - `{ status: 1, priority: 1 }`
    - `{ projectManager: 1 }`
    - `{ isActive: 1, isDeleted: 1 }`

- **Validation**
    - Project name: min 2, max 200 chars.
    - Budget: must be >= 0.
    - End date must be after start date.
    - External links must start with `http://` or `https://`.

---

## 8. Future Enhancements
- Real-time progress tracking.
- Integration with time tracking system.
- Notifications for deadlines and status changes.
