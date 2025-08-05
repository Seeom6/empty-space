
# Team & Roles Management System

## Overview
The **Team & Roles Management System** is responsible for organizing employees into teams, defining roles, managing permissions, and linking them to projects and tasks.

---

## Key Entities and Schemas

### 1. Team Schema
```typescript
@Schema({ timestamps: true })
export class Team {
  @Prop({ type: String, required: true, trim: true, minlength: 2, maxlength: 100 })
  name: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [TeamMember], default: [] })
  members: TeamMember[];

  @Prop({ type: [Types.ObjectId], ref: 'Project', default: [] })
  projects: Types.ObjectId[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}
```

### 2. TeamMember Schema
```typescript
@Schema({ _id: false })
export class TeamMember {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: ['manager', 'lead', 'member', 'hr'], default: 'member' })
  role: string;

  @Prop({ type: Date, default: Date.now })
  joinedAt: Date;
}
```

### 3. Role-Based Access Control (RBAC)
Roles and their permissions:
- **Admin**: Full control over teams, roles, and members.
- **Manager**: Can create and manage teams, assign roles.
- **HR**: Can add employees to teams, view all teams.
- **Member**: Can view own team and assigned tasks only.

---

## Relationships with Other Systems
- **Projects System**: A team can be linked to multiple projects.
- **Tasks System**: Tasks can be assigned to teams or individual members.
- **Employee System**: Team members are employees with assigned roles.

---

## Functionalities
- Create, update, delete teams.
- Add/remove team members.
- Assign roles to members.
- Link teams to projects.
- Manage team activity (active/inactive).
- Generate reports of team performance.

---

## Validation Rules
- Team name must be unique and 2–100 characters.
- Each member must have a valid role.
- A user cannot join the same team twice.

---

## Indexes
- `TeamSchema.index({ name: 1 }, { unique: true });`
- `TeamSchema.index({ isActive: 1 });`
- `TeamSchema.index({ 'members.userId': 1 });`

---

## Example JSON (Team)
```json
{
  "name": "Development Team",
  "description": "Handles all software development tasks",
  "createdBy": "64f1a8e3c2d4b5f9c1e2a3d4",
  "members": [
    { "userId": "64f1a8e3c2d4b5f9c1e2a3d5", "role": "manager" },
    { "userId": "64f1a8e3c2d4b5f9c1e2a3d6", "role": "member" }
  ],
  "projects": ["64f1a8e3c2d4b5f9c1e2a3f1"]
}
```
