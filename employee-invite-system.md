
# نظام تسجيل الموظفين باستخدام أكواد الدعوة

## الفكرة العامة
النظام يهدف إلى تسجيل الموظفين بشكل آمن وسهل باستخدام **كود دعوة (Invite Code)** يتم إنشاؤه مسبقًا من قبل الإدارة. عند استخدام الكود للتسجيل، يتم منح الموظف **القسم المرتبط** و**الصلاحيات الخاصة** بالكود.

---

## ✅ مكونات النظام

### **الجداول الرئيسية**
1. **Employees** – لتخزين بيانات الموظفين.
2. **Departments** – لتخزين الأقسام.
3. **Roles** – لتخزين الأدوار والصلاحيات العامة.
4. **InviteCodes** – لتخزين الأكواد التي يتم استخدامها للتسجيل.

---

## ✅ الفكرة الأساسية لعمل النظام
1. يتم إنشاء **كود دعوة** مرتبط بقسم وصلاحيات محددة.
2. الموظف عند التسجيل يكتب الكود في صفحة التسجيل.
3. النظام يتحقق من:
   - الكود موجود.
   - الكود غير مستخدم.
4. إذا كان الكود صالحًا:
   - يتم إنشاء حساب الموظف وربطه بالقسم والصلاحيات الموجودة في الكود.
   - يتم تحديث الكود إلى حالة (مستخدم).

---

## ✅ تصميم قاعدة البيانات (ERD)

### **الجداول والعلاقات**
- **Departments (الأقسام)**
  - `id` (UUID) – معرف القسم.
  - `name` (String) – اسم القسم.

- **Roles (الأدوار)**
  - `id` (UUID) – معرف الدور.
  - `name` (String) – اسم الدور مثل (Admin, HR, Staff).
  - `permissions` (JSON) – الصلاحيات المرتبطة بالدور.

- **Employees (الموظفون)**
  - `id` (UUID) – معرف الموظف.
  - `name` (String) – اسم الموظف.
  - `email` (String) – البريد الإلكتروني (فريد).
  - `password` (String) – كلمة المرور (مشفرة).
  - `department_id` (FK) – القسم المرتبط.
  - `role_id` (FK) – الدور المرتبط.
  - `created_at` (TIMESTAMP) – تاريخ إنشاء الحساب.

- **InviteCodes (أكواد الدعوة)**
  - `id` (UUID) – معرف الكود.
  - `code` (String) – رمز الكود الفعلي (فريد).
  - `department_id` (FK) – القسم المرتبط.
  - `permissions` (JSON) – الصلاحيات الخاصة بالكود.
  - `is_used` (BOOLEAN) – هل الكود مستخدم أم لا (افتراضي FALSE).
  - `used_by` (FK) – معرف الموظف الذي استخدم الكود (إن وجد).
  - `status` (ENUM: active, used) – حالة الكود.
  - `created_at` (TIMESTAMP) – تاريخ إنشاء الكود.

---

## ✅ العلاقات بين الجداول
- قسم واحد يحتوي على عدة موظفين: **Departments → Employees (1:N)**
- دور واحد يمكن أن يكون لعدة موظفين: **Roles → Employees (1:N)**
- قسم واحد يمكن أن يحتوي على عدة أكواد: **Departments → InviteCodes (1:N)**
- الكود يمكن أن يرتبط بموظف واحد عند استخدامه: **InviteCodes → Employees (0:1)**

---

## ✅ مخطط العلاقات (وصف نصي)
```
Departments (1) --------< Employees (Many)
Roles (1) --------------< Employees (Many)
Departments (1) --------< InviteCodes (Many)
InviteCodes (One) ------> Employees (Optional)
```

---

## ✅ منطق التحقق والاستخدام (Business Logic)
1. الموظف يدخل الكود عند التسجيل.
2. النظام يتحقق:
   - هل الكود موجود في جدول InviteCodes؟
   - هل الكود **غير مستخدم**؟ (`is_used = false`)
   - هل الكود حالته `active`؟
3. إذا كان صالحًا:
   - يتم إنشاء حساب الموظف.
   - يتم تحديث الكود:
     - `is_used = true`
     - `used_by = employee_id`
     - `status = 'used'`

---

## ✅ نموذج قاعدة البيانات (SQL)
```sql
CREATE TABLE Departments (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE Roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  permissions JSON NOT NULL
);

CREATE TABLE Employees (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  department_id UUID REFERENCES Departments(id),
  role_id UUID REFERENCES Roles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE InviteCodes (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  department_id UUID REFERENCES Departments(id),
  permissions JSON NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES Employees(id),
  status VARCHAR(20) CHECK (status IN ('active', 'used')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```
