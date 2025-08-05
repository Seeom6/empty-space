
# Analytics & Reporting System

## Overview
The **Analytics & Reporting System** provides insights and metrics from all connected modules (Projects, Tasks, Teams, Employees, Permissions). This system centralizes data visualization for decision-making and performance tracking.

---

## Core Features
- **Dashboard Metrics**
  - Total Projects (Active, Completed, On-Hold)
  - Task Completion Rate (Overall & Per Project)
  - Employee Performance Index
  - Team Efficiency Rating
- **Reports**
  - Project Progress Report
  - Task Status Distribution
  - Employee Attendance & Productivity Report
  - Financial Summary (Budget vs Actual)
- **Data Filters**
  - By Date Range
  - By Department
  - By Team / Project Manager
- **Export Options**
  - PDF, CSV, Excel
- **Charts & Graphs**
  - Bar Charts, Pie Charts, Line Charts
  - Real-Time KPIs

---

## Data Sources & Relationships
- **Projects** → Provides status, progress, deadlines, budget.
- **Tasks** → Provides completion rate, priority, overdue count.
- **Employees** → Attendance summary, performance reviews, involvement in projects.
- **Teams** → Team size, task distribution, collaboration efficiency.
- **Permissions** → Determines which user roles can access which analytics.

---

## Key Entities
### Analytics Widget
| Field         | Type        | Description |
|--------------|------------|-------------|
| name         | String     | Name of the metric or chart |
| type         | String     | Type of visualization (bar, line, pie, number) |
| dataSource   | String     | Which entity it fetches data from |
| filters      | Object     | Supported filter options |
| refreshRate  | Number     | Refresh interval in seconds |

### Report
| Field        | Type       | Description |
|-------------|-----------|-------------|
| title       | String    | Report title |
| description | String    | Short summary |
| data        | JSON      | Report data in structured format |
| generatedBy | ObjectId  | User who generated the report |
| createdAt   | Date      | When report was generated |

---

## Permissions & Roles
| Role       | Access Level |
|-----------|--------------|
| Admin     | Full access to all analytics and reports |
| Manager   | Access to team and project analytics |
| HR        | Access to employee performance and attendance reports |
| Employee  | Limited access (only own data) |

---

## API Endpoints
### **Analytics Endpoints**
- `GET /analytics/overview` → Fetch general dashboard stats
- `GET /analytics/projects` → Project analytics
- `GET /analytics/tasks` → Task completion and distribution
- `GET /analytics/employees` → Employee productivity and attendance
- `GET /analytics/teams` → Team performance analytics

### **Reports Endpoints**
- `POST /reports/generate` → Generate custom report
- `GET /reports` → List all reports
- `GET /reports/:id` → View specific report
- `DELETE /reports/:id` → Delete report

---

## Database Schema
### **Analytics Widget Schema**
```typescript
@Schema({ timestamps: true })
export class AnalyticsWidget {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  type: string; // bar, line, pie, number

  @Prop({ type: String, required: true })
  dataSource: string; // projects, tasks, employees, teams

  @Prop({ type: Object, default: {} })
  filters: Record<string, any>;

  @Prop({ type: Number, default: 60 })
  refreshRate: number; // in seconds
}
```

### **Report Schema**
```typescript
@Schema({ timestamps: true })
export class Report {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  data: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  generatedBy: Types.ObjectId;
}
```

---

## Integrations
- **Charts Library**: Chart.js / D3.js for rendering graphs
- **Export Service**: Integrated PDF/CSV generator
- **Authentication**: Uses the Permissions & Roles system to restrict access

---

## Future Enhancements
- Predictive Analytics (using AI models)
- Real-Time Notifications for critical KPIs
- Customizable Widgets for dashboard personalization
