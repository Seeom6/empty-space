Design a modern, modular, and responsive Admin Dashboard for an HR & Task Management System that integrates the following core systems:

1. **Header Section**:
   - App name/logo on the left.
   - User profile menu on the right (avatar, role, logout).
   - Notification bell icon with dropdown.

2. **Sidebar Navigation (Collapsible)**:
   Include the following menu items, grouped logically:
   - Dashboard (Home)
   - Employees
   - Projects
   - Tasks
   - Teams & Roles
   - Attendance
   - Payroll
   - Performance
   - Analytics & Reports
   - Settings
   - Permissions & Access Control

3. **Main Dashboard Widgets (Overview Page)**:
   - Total Employees (Active / Inactive)
   - Projects Overview (Planning / In Progress / Completed)
   - Task Completion Rate (by status)
   - Attendance Summary (Check-ins Today / Late / Absent)
   - Financial Summary (Total Salaries / Bonuses / Deductions)
   - Performance Score Overview (Top Performers)
   - Upcoming Deadlines & Alerts
   - Quick Links (e.g., Add Employee, Create Project)

4. **Charts & Visualizations**:
   - Bar chart for project statuses.
   - Pie chart for task distribution.
   - Line chart for attendance over time.
   - KPI cards with dynamic progress bars and icons.

5. **Role-Based Dashboard Views**:
   - Admin: Full data access.
   - HR: Employee, attendance, and payroll-related widgets only.
   - Manager: Teams, tasks, and performance only.
   - Employee: Personal metrics only (optional toggle).

6. **Dark Mode / Light Mode Toggle**

7. **Design Guidelines**:
   - Clean, professional UI.
   - Use modern color palettes and soft shadows.
   - Emphasize data readability.
   - Ensure responsiveness across desktop/tablet.
   - Use cards, tabs, and modular components.

The dashboard should feel like a central control panel for managing people, projects, and productivity across the organization. 
Design a responsive and intuitive Task Management System interface that integrates tightly with Projects and Teams. The UI should support the following core functionalities:

1. **Task Dashboard View**:
   - Filters by: Project, Status (To Do, In Progress, Blocked, Completed), Priority, Assignee.
   - Search bar (search by title).
   - Kanban board view with draggable tasks by status.
   - Option to toggle to Table View (with sorting columns: Title, Assignee, Due Date, Status, Progress, Priority).

2. **Task Card Component (for Kanban View)**:
   - Task title
   - Status color tag
   - Priority badge (Low, Medium, High, Critical)
   - Assignee avatar
   - Due date
   - Progress bar (0%–100%)

3. **Task Details Page / Drawer**:
   - Full task description
   - Assignee (with dropdown to change)
   - Project link (clickable)
   - Due date picker
   - Status & priority dropdowns
   - Watchers list (with add/remove option)
   - Tags (chips with color coding)
   - Activity log (comments, updates)

4. **Create/Edit Task Modal**:
   - Inputs for title, description
   - Assign to project & employee
   - Select due date
   - Set priority and status
   - Add tags and watchers

5. **Soft Delete & Restore**:
   - Deleted tasks go to "Trash" tab
   - Allow restore or permanent delete

6. **User Permissions Logic**:
   - Admin: Full CRUD access
   - Project Manager: CRUD on tasks under their projects
   - Team Member: Update own tasks, change status, add comments
   - HR: View-only access

7. **Additional Design Notes**:
   - Modern, clean UI with hover states.
   - Use of color-coded tags and priority indicators.
   - Mobile responsiveness for field users.
   - Use of modals, drawers, and tabs to reduce clutter.
Design a comprehensive and professional UI for a Project Management System that tracks all company projects. The interface should include the following views and features:

1. **Project List Page (Dashboard)**:
   - Filter & search by: Status (Planning, In Progress, Completed), Priority, Project Manager, Tags.
   - Table or Card Grid View with the following:
     - Project Name
     - Status & Priority badges
     - Progress bar (% complete)
     - Start/End/Deadline dates
     - Budget & currency
     - Project Manager avatar

2. **Project Details View**:
   - Tabs or Sections:
     - Overview: General info (description, tags, status, dates)
     - Team Members: List with role chips (Project Manager, Developer, etc.)
     - Tasks: Embedded task list or Kanban board
     - Technologies: Tags or icons
     - Timeline: Gantt-style chart
     - Budget vs Actual tracking (bar or line chart)

3. **Create/Edit Project Modal**:
   - Inputs for: Name, Description, Status, Priority, Dates, Budget, Currency.
   - Multi-select for Technologies & Members (with roles).
   - Option to create tasks inline.

4. **Analytics Widgets (Optional)**:
   - % of projects per status
   - Top performing projects
   - Overdue tasks count per project

5. **Roles & Permissions UX**:
   - Admin: Full access to create/edit/delete all projects.
   - Project Manager: Can manage own projects.
   - Team Lead: Can manage tasks only.
   - Employee: Read-only access to assigned projects and update own task progress.

6. **Design Notes**:
   - Use cards, tabs, collapsible sections.
   - Responsive layout with consistent theme.
   - Clear status indicators, colored progress bars.
   - Friendly UX for both technical and HR role
Design a UI for a Team and Roles Management System that allows administrators and managers to organize employees into teams, assign roles, and manage team-project relationships.

1. **Team List Page**:
   - Display a searchable list of teams with:
     - Team Name
     - Team Description
     - Number of Members
     - Number of Projects linked
     - Created By (user name)
     - Status (Active/Inactive)

2. **Team Details View**:
   - Tabs or collapsible sections:
     - Overview: Description, createdBy, createdAt
     - Members List: Show user avatar, name, role (Manager, Lead, Member, HR), joinedAt
     - Projects: Linked project names with status badges
     - Activity Logs (Optional): Recent team actions or edits

3. **Create/Edit Team Modal**:
   - Inputs for: Name, Description
   - Add/Remove Members with role assignment dropdown
   - Link/unlink projects via multi-select

4. **Role-Based Access Settings Page**:
   - Table view of role → permissions matrix
   - Editable list of roles: Admin, Manager, HR, Member
   - Add/Remove roles
   - Assign custom permissions (toggle style UI for each action: View, Create, Edit, Delete)

5. **Permission Rules Enforcement in UI**:
   - Admin: Full CRUD over teams, members, roles
   - Manager: Can create/manage teams and assign roles
   - HR: Add employees to teams, view-only
   - Member: View team and assigned tasks only

6. **Validation & UX Notes**:
   - Ensure a user can’t be added to same team twice
   - Prevent removal of last manager from any team
   - Responsive UI for easy mobile management
   - Use badges for roles, tooltips for permissions
Design a comprehensive and scalable UI for an Employee Management System that supports HR operations, role management, payroll, and performance tracking. The system should be modular, supporting sub-views and microservices logic.

1. **Employee List View (Directory)**:
   - Filters by: Department, Status (Active, Inactive, Terminated), Employment Type (Full-Time, Part-Time), Job Title, Manager
   - Table view with columns:
     - Full Name (First + Last)
     - Position / Job Title
     - Department
     - Status (badge)
     - Employment Type
     - Manager (name)
     - Email / Phone

2. **Employee Profile Page**:
   - Personal Info: Name, Email, Phone, Gender, Birth Date, Address
   - Job Info: Position, Department, Job Title, Employment Type, Status, Hire Date, Manager
   - Technologies Used (tag-style or icon grid)
   - Attendance Summary (days present, late, absent)
   - Performance Reviews (average rating, goals, feedback)
   - Payroll Info (base salary, bonuses, deductions, net salary)
   - Linked Projects and Roles

3. **Create/Edit Employee Modal**:
   - Step-wise or tabbed form
   - Input for personal + job info
   - Assign manager (autocomplete)
   - Assign technologies
   - Add to teams/projects

4. **Employee Overview Dashboard Widgets**:
   - Total Employees
   - Active / Inactive distribution (pie)
   - By Department (bar)
   - Hiring trends over time (line chart)

5. **HR Permissions Logic**:
   - Admin: Full CRUD
   - HR: Full CRUD (except delete)
   - Manager: View + update their team members
   - Employee: View own profile

6. **Design Guidelines**:
   - Use cards or tabbed views inside employee profile
   - Status colors (Active: green, Terminated: red)
   - Modular components for integrations with Attendance, Payroll, Performance
   - Scalable layout with both detailed and summary views
   - Responsive design across desktop and tablet
Design a functional and user-friendly UI for an Attendance & Time Tracking System that allows employees to check in/out, and lets HR and managers track attendance, lateness, and working hours.

1. **Employee Attendance Dashboard (Personal View)**:
   - Daily check-in/check-out buttons
   - Live status indicator (Checked In / Checked Out / Absent)
   - Summary panel: Total hours today, Late?, Absent?
   - Weekly calendar view:
     - Days of the week with status (Present, Absent, Late)
     - Tooltip for check-in/out times

2. **Admin/HR Attendance Overview**:
   - Filters: Date range, Department, Status (Late, Absent), Employee Name
   - Table view:
     - Date
     - Employee Name
     - Check-in Time
     - Check-out Time
     - Total Hours
     - Status (Badge)

3. **Team Attendance View (For Managers)**:
   - Compact view showing team member rows with columns for each weekday
   - Color codes:
     - Green = Present
     - Red = Absent
     - Yellow = Late
   - Expandable rows for detailed logs

4. **Analytics Widgets**:
   - % On-Time Attendance (line or donut chart)
   - Late Arrivals This Week
   - Top 5 Employees by Working Hours
   - Absence Rate by Department

5. **Permissions-Based Access**:
   - Employee: Can check in/out, view own records
   - Manager: View team attendance
   - HR/Admin: View all records, filter, export

6. **UX/Design Notes**:
   - Use toggle/check-in button with real-time state change
   - Calendar picker for past dates
   - Responsive layout for mobile punch-in use
   - Include icons for check-in/out (clock, exit symbol)
Design a structured and secure Payroll Management interface that allows HR and Admins to manage employee salaries, bonuses, deductions, and generate payslips. The UI should support visibility, control, and export options.

1. **Payroll Dashboard (Admin/HR View)**:
   - Summary cards:
     - Total Monthly Payroll
     - Bonuses Issued This Month
     - Deductions This Month
     - Upcoming Payment Dates
   - Filterable table:
     - Employee Name
     - Department
     - Base Salary
     - Bonuses (Sum)
     - Deductions (Sum)
     - Net Salary
     - Pay Date
     - Status (Paid / Pending)

2. **Employee Payroll Profile View**:
   - Monthly breakdown view:
     - Base Salary
     - Bonuses (List with amount, type, date)
     - Deductions (List with amount, type, date)
     - Net Salary (auto-calculated)
     - Download Payslip button

3. **Add/Edit Payroll Entry Modal**:
   - Select Employee
   - Enter Base Salary
   - Add multiple bonuses or deductions
   - Auto-calculate net salary
   - Set Pay Date

4. **Export & Reporting**:
   - Export payroll table to PDF, Excel
   - Generate payslip (PDF) with company branding
   - Integration-ready buttons (e.g., “Send to Finance”)

5. **Permissions Logic**:
   - Admin / HR: Full access to view and edit payroll
   - Employee: Can only view own payroll history and download payslips

6. **UX Notes**:
   - Use icons for bonuses (💰), deductions (⚠️)
   - Highlight overdue or pending salaries
   - Allow bulk salary updates (CSV upload optional)
   - Light, clean layout with tables and expandable rows
Design a clean and structured UI for a Performance Management System used by HR and Managers to evaluate employee performance, set goals, and track feedback. The system should allow both historical reviews and ongoing tracking.

1. **Performance Dashboard (Admin/Manager View)**:
   - Widgets showing:
     - Avg. Performance Score by Department
     - Top Rated Employees
     - Number of Active Reviews
     - Goal Completion Rate
   - Filterable table:
     - Employee Name
     - Department
     - Last Review Date
     - Average Rating
     - Pending Goals
     - Status (On Track / Needs Improvement)

2. **Employee Performance Profile**:
   - Review Timeline (chronological cards or timeline view)
   - Each review contains:
     - Date, Evaluator, Rating (1–5 stars)
     - Goals set, Achievements, Feedback, Areas for Improvement
     - Optional Attachments

3. **Review Modal / Form**:
   - Select Employee + Evaluator
   - Add:
     - Overall rating (1–5)
     - Goals (list)
     - Achievements
     - Feedback (text area)
     - Improvement areas
   - Save as draft or submit

4. **Goals Tracker**:
   - Tab or widget showing employee goals
   - Goal progress indicators (0–100%)
   - Editable by Manager or HR

5. **Permissions**:
   - HR/Admin: Full access to all reviews
   - Manager: Can evaluate team members
   - Employee: View only their own reviews, feedback, and goal progress

6. **UX Notes**:
   - Use badges for ratings (color-coded)
   - Use expandable/collapsible review items
   - Support optional anonymous feedback mode
   - Responsive layout for viewing performance via tablet
Design a visually rich and modular Analytics & Reporting Dashboard for a multi-module HR and Task Management System. The dashboard should consolidate data from projects, tasks, employees, teams, attendance, and financials.

1. **Analytics Home (Overview Dashboard)**:
   - KPI widgets with live data:
     - Total Projects (active, completed, on-hold)
     - Task Completion Rate (overall and per project)
     - Team Efficiency Score
     - Employee Attendance Summary
     - Payroll Total (Budget vs Actual)

2. **Charts & Visualizations**:
   - Bar Chart: Task status distribution by department
   - Pie Chart: Employee distribution by department
   - Line Chart: Attendance trends over time
   - Area Chart: Project progress vs timeline
   - Donut Chart: Financial breakdown (Salary, Bonuses, Deductions)

3. **Filters Panel (Left or Top)**:
   - Date Range Picker
   - Filter by:
     - Department
     - Team
     - Project Manager
     - Role

4. **Report Builder Interface**:
   - Generate custom reports (Projects, Tasks, Employees, Payroll)
   - Export options: PDF, CSV, Excel
   - Form to name report, select fields and filters
   - Saved reports section (list view)

5. **Report Details Page**:
   - Title, Generated By, Date
   - Description
   - Structured data view (table and charts)
   - Export/download button

6. **User Access Logic**:
   - Admin: Full analytics & report generation
   - Manager: View team/project analytics only
   - HR: Employee and attendance analytics
   - Employee: Only own performance/attendance metrics

7. **UI/UX Notes**:
   - Use tabs or sidebar for category-specific analytics (Projects, Tasks, Employees, Payroll)
   - Apply dynamic charts using libraries like Chart.js or D3
   - Make dashboard fully responsive with card-based layout
   - Allow saving favorite widgets or pinning to top
Design a secure, multi-step authentication and registration flow using invite codes, OTP verification, and role-based dashboard redirection. The system is designed for invited employees only.

1. **Login Page**:
   - Input fields: Email, Password
   - “Forgot Password?” link
   - Login button
   - Subtle "Powered by" branding area
   - Language toggle (optional)

2. **Start Registration (Invite Code Page)**:
   - Input: Invite Code
   - Validate button
   - Error message: “Invalid or Used Code”
   - Success state: move to next step

3. **Basic Info Form**:
   - Inputs: First Name, Last Name, Email
   - Hidden field: Invite Code (carried forward)
   - Submit button → triggers OTP send

4. **OTP Verification Page**:
   - Input field: 6-digit OTP
   - Message: “OTP sent to your email”
   - Timer for resending OTP
   - Button: Resend OTP
   - Error handling: Invalid OTP

5. **Password Setup Page**:
   - Input: Password + Confirm Password
   - Password strength indicator
   - Success message on completion: “Account Created, Redirecting…”

6. **Redirection Logic**:
   - After login/registration, redirect based on user role:
     - Admin → Admin Dashboard
     - HR → HR Panel
     - Manager → Team Overview
     - Employee → Personal Dashboard

7. **Admin Invite Management UI**:
   - Invite Code Generator Page:
     - Create new invite: select department + assign role + permissions
     - Generate unique code
     - View status: active / used / expired
     - Link used_by (employee) to invite history

8. **Security Notes in UX**:
   - OTP expires after 10 minutes
   - Invite code = single-use
   - Show progress indicators across steps (1–5)
   - Form validation and field masking for security

9. **UI/Design Notes**:
   - Smooth transitions between steps
   - Use stepper or breadcrumb-like UI (1. Code → 2. Info → 3. OTP → 4. Password → 5. Done)
   - Clean, secure, mobile-friendly design
   - Branding color theme for employer identity
Design a role-based access control (RBAC) UI that allows admins to create, assign, and manage system roles and permissions. The interface should provide visibility into which users can perform which actions across the HR & Task Management system.

1. **Roles Management View**:
   - List of all roles:
     - Name (e.g., Admin, HR Manager, Project Manager, Team Lead, Employee, User)
     - Description
     - Active Status (toggle)
     - Number of users assigned
     - Edit/Delete actions

2. **Role Details Page**:
   - General Info (role name, description)
   - Permissions Matrix (list of all permissions, checkboxes)
     - e.g. `create_project`, `view_task`, `delete_team`, etc.
   - Save Changes button
   - Clone Role option

3. **Create New Role Modal**:
   - Inputs for: Role Name, Description
   - Multi-select list of permissions
   - Toggle to activate/deactivate

4. **User Role Assignment View**:
   - Table of users with:
     - User Name
     - Assigned Role(s)
     - Assigned At (date)
     - Actions: Change Role / Revoke Access
   - Option to assign multiple roles
   - Validation: no duplicate roles per user

5. **Permission Library View**:
   - List of all defined permissions:
     - Permission name (e.g., `assign_task`)
     - Description
     - Active toggle
   - Searchable and grouped by category (Project, Task, Team, Payroll, etc.)

6. **Audit Logs Tab**:
   - Show history of role changes
   - Who assigned/revoked permissions and when

7. **Access Control UX Behavior**:
   - System actions in the UI should be restricted or hidden based on current user's permissions
   - Unauthorized access attempts should display error/toast: “You don’t have permission for this action.”

8. **Design Notes**:
   - Use toggle switches, chips, and icons for permission status
   - Responsive and scalable layout
   - Modular UI with tabs: Roles | Permissions | Users | Logs
   - Friendly for both technical and non-technical users
Design a role-based access control (RBAC) UI that allows admins to create, assign, and manage system roles and permissions. The interface should provide visibility into which users can perform which actions across the HR & Task Management system.

1. **Roles Management View**:
   - List of all roles:
     - Name (e.g., Admin, HR Manager, Project Manager, Team Lead, Employee, User)
     - Description
     - Active Status (toggle)
     - Number of users assigned
     - Edit/Delete actions

2. **Role Details Page**:
   - General Info (role name, description)
   - Permissions Matrix (list of all permissions, checkboxes)
     - e.g. `create_project`, `view_task`, `delete_team`, etc.
   - Save Changes button
   - Clone Role option

3. **Create New Role Modal**:
   - Inputs for: Role Name, Description
   - Multi-select list of permissions
   - Toggle to activate/deactivate

4. **User Role Assignment View**:
   - Table of users with:
     - User Name
     - Assigned Role(s)
     - Assigned At (date)
     - Actions: Change Role / Revoke Access
   - Option to assign multiple roles
   - Validation: no duplicate roles per user

5. **Permission Library View**:
   - List of all defined permissions:
     - Permission name (e.g., `assign_task`)
     - Description
     - Active toggle
   - Searchable and grouped by category (Project, Task, Team, Payroll, etc.)

6. **Audit Logs Tab**:
   - Show history of role changes
   - Who assigned/revoked permissions and when

7. **Access Control UX Behavior**:
   - System actions in the UI should be restricted or hidden based on current user's permissions
   - Unauthorized access attempts should display error/toast: “You don’t have permission for this action.”

8. **Design Notes**:
   - Use toggle switches, chips, and icons for permission status
   - Responsive and scalable layout
   - Modular UI with tabs: Roles | Permissions | Users | Logs
   - Friendly for both technical and non-technical users
Design a UI for a secure Employee Invitation and Registration System using invite codes. The system should support invite creation by admins and registration by invited employees.

1. **Invite Code Management Page (Admin View)**:
   - Table with:
     - Invite Code
     - Department
     - Permissions (short label or badge)
     - Status (Active / Used)
     - Used By (Employee name or “—” if unused)
     - Created At
   - Actions:
     - Create New Invite
     - Revoke Code
     - Filter by status or department

2. **Create Invite Modal**:
   - Inputs:
     - Select Department (dropdown)
     - Select Role (dropdown)
     - Define Permissions (checkbox or multiselect list)
   - Button: Generate Code
   - Output: Generated code with option to copy

3. **Registration Page (for Employee)**:
   - Step 1: Enter Invite Code
     - Validation: Show error if used/invalid
   - Step 2: Basic Info Form
     - First Name, Last Name, Email
   - Step 3: Set Password
   - Completion message: “Account created. You will be redirected.”

4. **UX Notes**:
   - Stepper UI for registration
   - Invite codes are single-use
   - Auto-link employee to department and permissions upon successful registration
   - Admin can monitor usage of invite codes
and add navigation to this page with leftsidebar navs Design a clean and structured UI for managing company technologies, including creation, assignment to employees, and tracking usage. The interface should support Admin and HR-level access control.

1. **Technologies List Page**:
   - Table or card grid with:
     - Technology Name
     - Category (Frontend, Backend, etc.)
     - Status (Active / Inactive / Deprecated)
     - Version
     - Icon (thumbnail)
     - Users Count
   - Filters:
     - By Category
     - By Status
     - Search by name

2. **Technology Details Page**:
   - General Info:
     - Name, Description, Icon
     - Status, Version
     - Documentation Link
   - List of Employees Using This Tech:
     - Name, Position, Assigned Date
   - Button: Assign New User

3. **Create / Edit Technology Modal**:
   - Inputs:
     - Name, Category
     - Description
     - Status
     - Icon upload (PNG/SVG)
     - Version
     - Documentation link

4. **Assign Technology to User Modal**:
   - Dropdown for selecting employee
   - Auto-capture assigned time

5. **Permissions Logic**:
   - Admin/HR: Full CRUD and assignment
   - Employee: View only

6. **UX Notes**:
   - Use color-coded status chips
   - Display technology icons (SVG preview)
   - Responsive design for admin panels
   - Optionally show "most used technologies" widget
and also add nav for this
now this will be the logo please build this design with next.js ,typescript and tailwindcss v4 and make the code reuseable and scalable and good for performance and clean code and make axios and tanstack query for full restfull api's