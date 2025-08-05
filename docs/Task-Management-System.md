
# Task Management System Documentation

## Overview
The Task Management System is responsible for creating, managing, assigning, and tracking tasks within projects. It is linked with the Project Management System and the Employee/User Management System.

---

## Core Features
- Create tasks for a specific project
- Assign tasks to employees or users
- Track task status (ToDo, In Progress, Completed, Blocked)
- Set priorities (Low, Medium, High, Critical)
- Manage deadlines and progress tracking
- Allow comments and attachments
- Integrate with project analytics for performance insights

---

## Schema Design

### Task Schema
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

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

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: String, required: true, trim: true, minlength: 2, maxlength: 200 })
  title: string;

  @Prop({ type: String, trim: true, maxlength: 2000 })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

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

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String })
  notes?: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
```

---

## Indexes
- `title` (text) for search
- `projectId` for quick filtering tasks by project
- `status` + `priority` compound index
- `assignee` for task assignment filtering

---

## Roles & Permissions
- **Admin**: Full access (CRUD on all tasks)
- **Project Manager**: CRUD tasks for their projects
- **Employee**: Update own tasks, change status, add comments
- **HR**: Read-only access for reports

---

## API Endpoints
- `POST /tasks` → Create a new task
- `GET /tasks/:id` → Get task details
- `PUT /tasks/:id` → Update task details
- `DELETE /tasks/:id` → Soft delete task
- `GET /tasks/project/:projectId` → List all tasks under a project
- `PATCH /tasks/:id/status` → Update task status

---

## Analytics & Reports
- Tasks per project
- Completed vs Pending tasks
- Average completion time
- Overdue tasks report
```

