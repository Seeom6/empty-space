
# Permissions and Roles Management System

## Overview
The **Permissions and Roles Management System** is designed to manage access control across the Project Management, Team Management, and Task Management systems. It ensures that each user has the appropriate level of access and permissions based on their role within the organization.

---

## **Core Components**
1. **Roles**
   - Predefined roles with specific permissions.
   - Examples: Admin, HR Manager, Project Manager, Team Lead, Employee, User.

2. **Permissions**
   - Granular permissions for CRUD operations and system-level actions.
   - Permissions can be assigned to roles or directly to users.

3. **Role Hierarchy**
   - Admin > HR Manager > Project Manager > Team Lead > Employee > User

---

## **Schemas**

### **Role Schema**
```typescript
@Schema({ timestamps: true })
export class Role {
  @Prop({ type: String, required: true, unique: true, trim: true })
  name: string; // e.g., admin, project_manager, team_lead

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: [String], default: [] })
  permissions: string[]; // e.g., ['create_project', 'delete_task']

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}
```

---

### **Permission Schema**
```typescript
@Schema({ timestamps: true })
export class Permission {
  @Prop({ type: String, required: true, unique: true, trim: true })
  name: string; // e.g., create_project, update_task

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}
```

---

### **UserRole Schema**
```typescript
@Schema({ timestamps: true })
export class UserRole {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  assignedAt: Date;
}
```

---

## **Key Permissions**
- `create_project`, `update_project`, `delete_project`, `view_project`
- `create_task`, `update_task`, `delete_task`, `view_task`
- `create_team`, `update_team`, `delete_team`, `view_team`
- `manage_roles`, `manage_permissions`
- `assign_task`, `assign_role`
- `approve_leave`, `manage_attendance`

---

## **Role Examples**
- **Admin**
  - Full access to all systems and operations.
- **HR Manager**
  - Manage employees, attendance, leaves.
- **Project Manager**
  - Manage projects, tasks, and teams under their supervision.
- **Team Lead**
  - Manage team tasks, assign tasks to team members.
- **Employee**
  - View and update assigned tasks, log attendance.
- **User**
  - Limited access (personal dashboard only).

---

## **Indexes**
- **Role Schema**
  - `{ name: 1 }` (unique)
- **Permission Schema**
  - `{ name: 1 }` (unique)
- **UserRole Schema**
  - `{ userId: 1, roleId: 1 }` (compound, unique)

---

## **Validation Rules**
- Role name must be unique and alphanumeric.
- Permission name must be unique.
- Each user can have multiple roles, but duplication of roles per user is not allowed.

---

## **Relationships**
- **User ↔ Role** (Many-to-Many through UserRole)
- **Role ↔ Permissions** (One-to-Many)
- Roles are linked to system operations for Project, Task, and Team Management.

---

## **Access Control Logic**
- Before performing any CRUD operation, check if:
  1. User has a role with the required permission.
  2. Permission is active.
  3. User status is active.

---

## **Analytics & Reports**
- Roles distribution across the organization.
- Permissions usage and access logs.
- Audit trail of role changes and permission assignments.

---

## **Admin Dashboard Features**
- Create/Update/Delete roles.
- Assign permissions to roles.
- Assign roles to users.
- View permission matrix.

---

