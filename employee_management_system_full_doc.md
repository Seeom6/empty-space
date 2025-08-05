
# Employee Management System - Full Documentation

---

## 🇬🇧 English Version

### ✅ Overview
This system is a **modular employee management platform** built with **NestJS + MongoDB**, divided into several independent modules that interact with each other through relationships. It ensures scalability, clean architecture, and easy maintenance.

---

## ✅ Main Modules and Responsibilities

### **1. Employee Management Module**
- Handles all employee-related data.
- Stores personal and professional details.
- Links employees to other modules such as technologies, attendance, and payroll.

**Core Fields:**
- firstName, lastName, email, phone
- department, position, employmentType, status
- managerId (relation to another employee)
- technologies [Array of ObjectId]

**Key Features:**
- Create, Update, Delete employees.
- Assign technologies, projects, and roles.

---

### **2. Technology Management Module**
- Manages the list of technologies used in the company.
- Supports CRUD operations for technologies.
- Links employees to the technologies they use.

**Fields:**
- name, category, description
- status (active/inactive/duplicated)
- version, icon, documentation_link
- users_used [Array of Employee IDs]

---

### **3. Attendance Management Module**
- Allows employees to check in and check out from their dashboard.
- Tracks work hours and attendance summary.

**Fields:**
- employeeId
- date
- checkInTime, checkOutTime
- totalHours
- status (Present, Absent, Late)

**Logic:**
- If user clicks **Check-In**, system stores date and time.
- If user clicks **Check-Out**, system calculates `totalHours`.
- Absence is calculated if no check-in for a working day.

---

### **4. Salary & Payroll Module**
- Manages employee salary, bonuses, and deductions.

**Fields:**
- employeeId
- baseSalary
- bonuses [{ amount, type, date }]
- deductions [{ amount, type, date }]

---

### **5. Performance Management Module**
- Tracks performance reviews, goals, and achievements.

---

### **6. Project Management Module**
- Stores projects assigned to employees.
- Tracks roles, technologies used, and duration.

---

## ✅ Relationships (ERD)
- **Employee ↔ Technology:** Many-to-Many
- **Employee ↔ Attendance:** One-to-Many
- **Employee ↔ Salary:** One-to-One
- **Employee ↔ Projects:** One-to-Many
- **Employee ↔ Performance:** One-to-Many

---

## ✅ Dashboard Analysis
The final dashboard should include:
- **Employee Overview:** Active employees, departments distribution.
- **Attendance Tracking:** Daily check-ins, late arrivals, absences.
- **Technology Usage:** Most used technologies, employee skills.
- **Payroll Insights:** Salary reports, bonus trends.
- **Performance:** Ratings, reviews summary.
- **Projects:** Active projects, team assignments.

---

## ✅ API Responsibilities
- **Authentication Module:** Manages user login and role-based access.
- **Employee Module:** CRUD for employees, search, filters.
- **Technology Module:** CRUD for technologies, assign/unassign to employees.
- **Attendance Module:** Check-In, Check-Out, reports.
- **Payroll Module:** Manage salaries and generate payroll reports.
- **Performance Module:** Handle performance evaluations.
- **Projects Module:** Manage employee projects.

---

---

## 🇸🇦 النسخة العربية

### ✅ نظرة عامة
النظام عبارة عن **منصة إدارة موظفين** مبنية باستخدام **NestJS + MongoDB**، مقسمة إلى عدة أنظمة مستقلة تتفاعل مع بعضها عن طريق العلاقات. الهدف هو **المرونة، قابلية التوسع، وسهولة الصيانة**.

---

## ✅ الأنظمة الرئيسية والوظائف

### **1. نظام إدارة الموظفين**
- إدارة بيانات الموظفين الأساسية والمهنية.
- ربط الموظفين بالتكنولوجيات، الحضور، والرواتب.

**الحقول الأساسية:**
- الاسم الأول، الاسم الأخير، البريد الإلكتروني، الهاتف
- القسم، المسمى الوظيفي، نوع التوظيف، الحالة
- المدير المباشر
- التكنولوجيات [قائمة معرفات]

**المهام:**
- إضافة، تعديل، حذف الموظفين.
- ربط الموظفين بالتكنولوجيات والمشاريع.

---

### **2. نظام إدارة التكنولوجيات**
- إدارة التكنولوجيات المستخدمة في الشركة.
- يسمح بإنشاء وتحديث التكنولوجيات.
- ربط الموظفين بالتكنولوجيات.

**الحقول:**
- الاسم، التصنيف، الوصف
- الحالة (نشط، غير نشط، مكرر)
- النسخة، الأيقونة، رابط التوثيق
- المستخدمون [IDs الموظفين]

---

### **3. نظام الحضور والغياب**
- تسجيل الحضور عبر زر **تسجيل الدخول (Check-In)** في الصفحة الشخصية.
- تسجيل الخروج وحساب ساعات العمل.

**الحقول:**
- employeeId
- التاريخ
- وقت الدخول، وقت الخروج
- عدد الساعات
- الحالة (حاضر، غائب، متأخر)

**المنطق:**
- عند الضغط على **Check-In** يتم حفظ التاريخ والوقت.
- عند الضغط على **Check-Out** يتم حساب الساعات.
- في حال لم يتم تسجيل الدخول يعتبر غياب.

---

### **4. نظام الرواتب والمكافآت**
- إدارة راتب الموظف والمكافآت والخصومات.

---

### **5. نظام تقييم الأداء**
- إدارة التقييمات والأهداف والإنجازات.

---

### **6. نظام إدارة المشاريع**
- إدارة المشاريع وتفاصيلها والتكنولوجيات المستخدمة فيها.

---

## ✅ العلاقات (ERD)
- **الموظف ↔ التكنولوجيا:** متعدد لمتعدد
- **الموظف ↔ الحضور:** واحد لمتعدد
- **الموظف ↔ الرواتب:** واحد لواحد
- **الموظف ↔ المشاريع:** واحد لمتعدد
- **الموظف ↔ الأداء:** واحد لمتعدد

---

## ✅ تحليل لوحة التحكم
يجب أن تحتوي لوحة التحكم على:
- **إحصائيات الموظفين:** عدد النشطين، التوزيع حسب الأقسام.
- **إحصائيات الحضور:** تسجيلات اليوم، حالات الغياب، التأخير.
- **التكنولوجيات:** أكثر التكنولوجيات استخدامًا، مستوى المهارات.
- **الرواتب:** تقارير الرواتب والمكافآت.
- **الأداء:** ملخص التقييمات.
- **المشاريع:** المشاريع النشطة وفِرَق العمل.

---

## ✅ المهام البرمجية
- **نظام الدخول والصلاحيات:** لإدارة تسجيل الدخول والتحكم بالأدوار.
- **نظام الموظفين:** CRUD للموظفين مع البحث والتصفية.
- **نظام التكنولوجيات:** CRUD للتكنولوجيات وربطها بالموظفين.
- **نظام الحضور:** تسجيل الدخول والخروج مع التقارير.
- **نظام الرواتب:** إدارة الرواتب وإنشاء تقارير.
- **نظام الأداء:** إدارة التقييمات.
- **نظام المشاريع:** إدارة المشاريع وربطها بالموظفين.

---
