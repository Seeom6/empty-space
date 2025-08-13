
# Technology Management System

## Overview
This system allows **Admins** and **HR** users to manage technologies within the platform. It supports full CRUD operations (Create, Read, Update, Delete) and enables linking technologies to employees who use them.

---

## ✅ Features
- **Create new technologies** (Admins & HR only).
- **Update technology details** (Admins & HR only).
- **Delete technologies** (Admins & HR only).
- **View technologies** (All users).
- **Assign technologies to users** (Admins & HR only).

---

## ✅ Roles and Permissions

| Action      | Admin | HR | Employee |
|-------------|-------|----|----------|
| Create      | ✅    | ✅ | ❌       |
| Update      | ✅    | ✅ | ❌       |
| Delete      | ✅    | ✅ | ❌       |
| View        | ✅    | ✅ | ✅       |

---

## ✅ Technology Fields

| Field                | Type       | Description                                      |
|----------------------|-----------|--------------------------------------------------|
| `_id`               | ObjectId  | Unique identifier                                |
| `name`              | String    | Technology name                                  |
| `category`          | String    | Category (e.g., Frontend, Backend, Database)    |
| `description`       | String    | Technology description                           |
| `status`            | String    | Status: `active`, `inactive`, `deprecated`      |
| `icon`              | String    | URL of the icon (PNG or SVG)                    |
| `documentation_link`| String    | Official documentation link                     |
| `version`           | String    | Technology version (e.g., v1.0.0)               |
| `created_by`        | ObjectId  | Admin or HR who created the record              |
| `users_used`        | [{ObjectId  , time of user Assigned}]| List of employees using this technology         |
| `created_at`        | Date      | Creation timestamp                               |
| `updated_at`        | Date      | Last update timestamp                            |

---

## ✅ MongoDB Schema (Mongoose)

```js
const TechnologySchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'deprecated'], default: 'active' },
  icon: { type: String, required: false }, // PNG or SVG URL
  documentation_link: { type: String, required: false },
  version: { type: String, required: true },
  created_by: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  users_used: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});
```

---

## ✅ Relationships
- One **technology** can be used by multiple users.
- One **user** can use multiple technologies.
- Relationship: **Many-to-Many** between `Technology` and `Employees`.

---

## ✅ API Endpoints

### **1. POST /technologies**
Create a new technology (**Admins & HR only**).

**Request:**
```json
{
  "name": "React.js",
  "category": "Frontend",
  "description": "A JavaScript library for building UIs",
  "status": "active",
  "icon": "https://cdn.example.com/icons/react.svg",
  "documentation_link": "https://reactjs.org/docs/getting-started.html",
  "version": "v18.2.0"
}
```
**Response:**
```json
{
  "status": "success",
  "message": "Technology created successfully",
  "data": {
    "_id": "64a1b3...",
    "name": "React.js",
    "status": "active"
  }
}
```

---

### **2. GET /technologies**
Retrieve all technologies (accessible by all users).

---

### **3. GET /technologies/:id**
Retrieve details of a specific technology.

---

### **4. PUT /technologies/:id**
Update technology details (**Admins & HR only**).

---

### **5. DELETE /technologies/:id**
Delete a technology (**Admins & HR only**).

---

### **6. PATCH /technologies/:id/users**
Assign or remove users to/from a technology.

**Request Example:**
```json
{
  "action": "add",
  "user_id": "64b2c3..."
}
```

---

## ✅ Business Logic
- **Admins & HR only** can create, update, or delete technologies.
- **Soft delete** can be implemented by changing `status` to `inactive`.
- **Update** should refresh the `updated_at` field.
- When linking a user to a technology, add their ID to `users_used` array.

---

## ✅ Notes for Implementation
- Ensure **role-based access control (RBAC)** for API endpoints.
- Validate technology name to avoid duplicates.
- Optionally, implement **search and filtering** by `status` or `category`.

