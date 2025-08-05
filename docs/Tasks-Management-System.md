
# Tasks Management System

## Overview
The **Tasks Management System** is a core module that handles the creation, assignment, tracking, and management of tasks within projects. It integrates tightly with the **Project Management System** and **Team Management System** to ensure smooth workflow and accountability.

---

## **Schema Design**

### **Task Schema**
```typescript
@Schema({ timestamps: true })
export class Task {
  @Prop({ type: String, required: true, trim: true, minlength: 2, maxlength: 200 })
  title: string;

  @Prop({ type: String, trim: true, maxlength: 2000 })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

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

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  watchers: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}
```

---

### **Enums**
```typescript
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}
```

---

### **Indexes**
- `title` (text index for searching tasks by title)
- `status` and `priority` (compound index for filtering tasks)
- `projectId` (index for fast retrieval of tasks by project)
- `assignee` (index for user-specific tasks)

---

## **Core Features**
✔ Create, update, delete tasks  
✔ Assign tasks to team members  
✔ Set deadlines and priorities  
✔ Track task progress  
✔ Add watchers and tags  
✔ Soft delete support  

---

## **Permissions & Roles**
- **Admin**: Full control (CRUD for all tasks)
- **Project Manager**: Create, assign, update tasks for projects they manage
- **Team Member**: Update tasks assigned to them, change status, add comments
- **HR**: View tasks for reporting and performance tracking

---

## **Relationships**
- **Project Management System** → A project can have multiple tasks
- **Team Management System** → Tasks are assigned to team members within a project
- **Employee Management System** → Task completion affects employee performance metrics

---

## **Analytics & Dashboard**
- Tasks per project
- Task completion rate
- Overdue tasks
- Tasks by priority/status
- Tasks per team member
