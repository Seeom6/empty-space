'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'ar'
type Direction = 'ltr' | 'rtl'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  direction: Direction
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation keys type for better TypeScript support
export type TranslationKey = keyof typeof translations.en

// Comprehensive translations
const translations = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.add': 'Add',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.refresh': 'Refresh',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.reset': 'Reset',
    'common.clear': 'Clear',
    
    // Company & Branding
    'company.name': 'Empty Space',
    'company.tagline': 'HR Management',
    'company.copyright': '© 2024 All rights reserved',
    'company.version': 'Empty Space HR v2.0',
    
    // Header
    'header.search.placeholder': 'Search employees, projects, tasks...',
    'header.notifications': 'Notifications',
    'header.profile': 'Profile',
    'header.settings': 'Settings',
    'header.signOut': 'Sign out',
    'header.signOut.description': 'End your session',
    'header.profile.description': 'Manage your account',
    'header.settings.description': 'Preferences & privacy',
    'header.currentRole': 'Current Role',
    
    // Sidebar Navigation
    'nav.mainMenu': 'Main Menu',
    'nav.system': 'System',
    'nav.dashboard': 'Dashboard',
    'nav.employees': 'Employees',
    'nav.projects': 'Projects', 
    'nav.tasks': 'Tasks',
    'nav.teams': 'Teams',
    'nav.attendance': 'Attendance',
    'nav.payroll': 'Payroll',
    'nav.performance': 'Performance',
    'nav.analytics': 'Analytics',
    'nav.invitations': 'Invitations',
    'nav.invitations.description': 'Manage employee invite codes',
    'nav.technologies': 'Technologies',
    'nav.technologies.description': 'Company tech stack',
    'nav.permissions': 'Permissions',
    'nav.permissions.description': 'Role-based access control',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.welcome': 'Good morning! 👋',
    'dashboard.welcome.description': "Here's what's happening with your {type} today.",
    'dashboard.welcome.work': 'work',
    'dashboard.welcome.team': 'team',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.recentActivity.live': 'Live',
    'dashboard.recentActivity.viewAll': 'View all activity',
    'dashboard.today': 'Today',
    
    // KPI Cards
    'kpi.totalEmployees': 'Total Employees',
    'kpi.totalEmployees.subtitle': 'Company wide',
    'kpi.activeProjects': 'Active Projects',
    'kpi.activeProjects.subtitle': 'In progress',
    'kpi.pendingTasks': 'Pending Tasks',
    'kpi.pendingTasks.subtitle': 'Need attention',
    'kpi.attendance': 'Attendance',
    'kpi.attendance.subtitle': 'This month',
    'kpi.payrollProcessed': 'Payroll Processed',
    'kpi.payrollProcessed.subtitle': 'Current month',
    'kpi.performance': 'Performance',
    'kpi.performance.subtitle': 'Average score',
    'kpi.myTasks': 'My Tasks',
    'kpi.myTasks.subtitle': 'Active assignments',
    'kpi.teamMembers': 'Team Members',
    'kpi.teamMembers.subtitle': 'Under management',
    'kpi.newHires': 'New Hires',
    'kpi.newHires.subtitle': 'This month',
    'kpi.projects': 'Projects',
    'kpi.projects.subtitle': 'Currently involved',
    'kpi.teamPerformance': 'Team Performance',
    'kpi.teamPerformance.subtitle': 'Average score',
    'kpi.attendanceRate': 'Attendance Rate',
    'kpi.attendanceRate.subtitle': 'This month',
    
    // Trends
    'trend.vsLastMonth': 'vs last month',
    'trend.vsLastWeek': 'vs last week',
    'trend.thisMonth': 'this month',
    'trend.thisQuarter': 'this quarter',
    'trend.thisWeek': 'new this week',
    'trend.activeProjects': 'active projects',
    'trend.inYourTeams': 'in your teams',
    'trend.avgScore': 'avg score',
    'trend.currentScore': 'current score',
    'trend.currentlyInvolved': 'currently involved',
    
    // Quick Actions
    'quickActions.addEmployee': 'Add Employee',
    'quickActions.addEmployee.description': 'Onboard new team member',
    'quickActions.createProject': 'Create Project',
    'quickActions.createProject.description': 'Start new initiative',
    'quickActions.assignTask': 'Assign Task',
    'quickActions.assignTask.description': 'Delegate work to team',
    'quickActions.viewReports': 'View Reports',
    'quickActions.viewReports.description': 'Analyze team performance',
    'quickActions.myTasks': 'My Tasks',
    'quickActions.myTasks.description': 'View assigned work',
    'quickActions.logTime': 'Log Time',
    'quickActions.logTime.description': 'Track attendance',
    
    // Activity Types
    'activity.completedTask': 'completed task',
    'activity.joinedProject': 'joined project',
    'activity.updatedAttendance': 'updated attendance',
    'activity.submittedReview': 'submitted review',
    
    // Charts
    'charts.attendanceTrends': 'Attendance Trends',
    'charts.projectStatus': 'Project Status',
    'charts.taskDistribution': 'Task Distribution',
    
    // Settings
    'settings.title': 'Settings',
    'settings.description': 'Manage your application preferences and configurations.',
    'settings.systemPreferences': 'System Preferences',
    'settings.systemPreferences.description': 'Configure system-wide settings and defaults.',
    'settings.userManagement': 'User Management',
    'settings.userManagement.description': 'Manage user accounts and access permissions.',
    'settings.notifications': 'Notifications',
    'settings.notifications.description': 'Configure email and push notification settings.',
    'settings.dataPrivacy': 'Data & Privacy',
    'settings.dataPrivacy.description': 'Manage data retention and privacy policies.',
    
    // Loading States
    'loading.title': 'Loading...',
    'loading.description': 'Please wait while we load the content',
    
    // Languages
    'language.english': 'English',
    'language.arabic': 'العربية',
    'language.switchTo': 'Switch to {language}',
    
    // Dates and Times
    'date.today': 'Today',
    'date.yesterday': 'Yesterday',
    'date.thisWeek': 'This week',
    'date.lastWeek': 'Last week',
    'date.thisMonth': 'This month',
    'date.lastMonth': 'Last month',
    'time.minutesAgo': '{count} minutes ago',
    'time.hoursAgo': '{count} hours ago',
    'time.daysAgo': '{count} days ago',
    'time.justNow': 'Just now',
    
    // User Roles
    'role.admin': 'Admin',
    'role.hr': 'HR',
    'role.manager': 'Manager',
    'role.employee': 'Employee',
    
    // Status
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.inProgress': 'In Progress',
    'status.draft': 'Draft',
    'status.published': 'Published',
    'status.archived': 'Archived'
  },
  
  ar: {
    // Common
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تحرير',
    'common.view': 'عرض',
    'common.add': 'إضافة',
    'common.create': 'إنشاء',
    'common.update': 'تحديث',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.refresh': 'تحديث',
    'common.close': 'إغلاق',
    'common.confirm': 'تأكيد',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.ok': 'موافق',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.submit': 'إرسال',
    'common.reset': 'إعادة تعيين',
    'common.clear': 'مسح',
    
    // Company & Branding
    'company.name': 'الفراغ الفارغ',
    'company.tagline': 'إدارة الموارد البشرية',
    'company.copyright': '© 2024 جميع الحقوق محفوظة',
    'company.version': 'الفراغ الفارغ HR الإصدار 2.0',
    
    // Header
    'header.search.placeholder': 'البحث عن الموظفين والمشاريع والمهام...',
    'header.notifications': 'الإشعارات',
    'header.profile': 'الملف الشخصي',
    'header.settings': 'الإعدادات',
    'header.signOut': 'تسجيل الخروج',
    'header.signOut.description': 'إنهاء الجلسة',
    'header.profile.description': 'إدارة حسابك',
    'header.settings.description': 'التفضيلات والخصوصية',
    'header.currentRole': 'الدور الحالي',
    
    // Sidebar Navigation
    'nav.mainMenu': 'القائمة الرئيسية',
    'nav.system': 'النظام',
    'nav.dashboard': 'لوحة التحكم',
    'nav.employees': 'الموظفون',
    'nav.projects': 'المشاريع',
    'nav.tasks': 'المهام',
    'nav.teams': 'الفرق',
    'nav.attendance': 'الحضور',
    'nav.payroll': 'كشوف المرتبات',
    'nav.performance': 'الأداء',
    'nav.analytics': 'التحليلات',
    'nav.invitations': 'الدعوات',
    'nav.invitations.description': 'إدارة رموز دعوة الموظفين',
    'nav.technologies': 'التقنيات',
    'nav.technologies.description': 'مجموعة التقنيات للشركة',
    'nav.permissions': 'الصلاحيات',
    'nav.permissions.description': 'التحكم في الوصول حسب الدور',
    'nav.settings': 'الإعدادات',
    
    // Dashboard
    'dashboard.welcome': 'صباح الخير! 👋',
    'dashboard.welcome.description': 'إليك ما يحدث مع {type} اليوم.',
    'dashboard.welcome.work': 'عملك',
    'dashboard.welcome.team': 'فريقك',
    'dashboard.quickActions': 'الإجراءات السريعة',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.recentActivity.live': 'مباشر',
    'dashboard.recentActivity.viewAll': 'عرض جميع الأنشطة',
    'dashboard.today': 'اليوم',
    
    // KPI Cards
    'kpi.totalEmployees': 'إجمالي الموظفين',
    'kpi.totalEmployees.subtitle': 'على مستوى الشركة',
    'kpi.activeProjects': 'المشاريع النشطة',
    'kpi.activeProjects.subtitle': 'قيد التنفيذ',
    'kpi.pendingTasks': 'المهام المعلقة',
    'kpi.pendingTasks.subtitle': 'تحتاج إلى انتباه',
    'kpi.attendance': 'الحضور',
    'kpi.attendance.subtitle': 'هذا الشهر',
    'kpi.payrollProcessed': 'كشوف المرتبات المعالجة',
    'kpi.payrollProcessed.subtitle': 'الشهر الحالي',
    'kpi.performance': 'الأداء',
    'kpi.performance.subtitle': 'متوسط النتيجة',
    'kpi.myTasks': 'مهامي',
    'kpi.myTasks.subtitle': 'المهام النشطة',
    'kpi.teamMembers': 'أعضاء الفريق',
    'kpi.teamMembers.subtitle': 'تحت الإدارة',
    'kpi.newHires': 'الموظفون الجدد',
    'kpi.newHires.subtitle': 'هذا الشهر',
    'kpi.projects': 'المشاريع',
    'kpi.projects.subtitle': 'المشاركة الحالية',
    'kpi.teamPerformance': 'أداء الفريق',
    'kpi.teamPerformance.subtitle': 'متوسط النتيجة',
    'kpi.attendanceRate': 'معدل الحضور',
    'kpi.attendanceRate.subtitle': 'هذا الشهر',
    
    // Trends
    'trend.vsLastMonth': 'مقارنة بالشهر الماضي',
    'trend.vsLastWeek': 'مقارنة بالأسبوع الماضي',
    'trend.thisMonth': 'هذا الشهر',
    'trend.thisQuarter': 'هذا الربع',
    'trend.thisWeek': 'جديد هذا الأسبوع',
    'trend.activeProjects': 'المشاريع النشطة',
    'trend.inYourTeams': 'في فرقك',
    'trend.avgScore': 'متوسط النتيجة',
    'trend.currentScore': 'النتيجة الحالية',
    'trend.currentlyInvolved': 'المشاركة الحالية',
    
    // Quick Actions
    'quickActions.addEmployee': 'إضافة موظف',
    'quickActions.addEmployee.description': 'تعيين عضو جديد في الفريق',
    'quickActions.createProject': 'إنشاء مشروع',
    'quickActions.createProject.description': 'بدء مبادرة جديدة',
    'quickActions.assignTask': 'تعيين مهمة',
    'quickActions.assignTask.description': 'تفويض العمل للفريق',
    'quickActions.viewReports': 'عرض التقارير',
    'quickActions.viewReports.description': 'تحليل أداء الفريق',
    'quickActions.myTasks': 'مهامي',
    'quickActions.myTasks.description': 'عرض العمل المعين',
    'quickActions.logTime': 'تسجيل الوقت',
    'quickActions.logTime.description': 'تتبع الحضور',
    
    // Activity Types
    'activity.completedTask': 'أكمل مهمة',
    'activity.joinedProject': 'انضم للمشروع',
    'activity.updatedAttendance': 'حديث الحضور',
    'activity.submittedReview': 'قدم مراجعة',
    
    // Charts
    'charts.attendanceTrends': 'اتجاهات الحضور',
    'charts.projectStatus': 'حالة المشروع',
    'charts.taskDistribution': 'توزيع المهام',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.description': 'إدارة تفضيلات التطبيق والتكوينات.',
    'settings.systemPreferences': 'تفضيلات النظام',
    'settings.systemPreferences.description': 'تكوين الإعدادات والافتراضيات على مستوى النظام.',
    'settings.userManagement': 'إدارة المستخدمين',
    'settings.userManagement.description': 'إدارة حسابات المستخدمين وصلاحيات الوصول.',
    'settings.notifications': 'الإشعارات',
    'settings.notifications.description': 'تكوين إعدادات البريد الإلكتروني والإشعارات.',
    'settings.dataPrivacy': 'البيانات والخصوصية',
    'settings.dataPrivacy.description': 'إدارة سياسات الاحتفاظ بالبيانات والخصوصية.',
    
    // Loading States
    'loading.title': 'جاري التحميل...',
    'loading.description': 'يرجى الانتظار أثناء تحميل المحتوى',
    
    // Languages
    'language.english': 'الإنجليزية',
    'language.arabic': 'العربية',
    'language.switchTo': 'التبديل إلى {language}',
    
    // Dates and Times
    'date.today': 'اليوم',
    'date.yesterday': 'أمس',
    'date.thisWeek': 'هذا الأسبوع',
    'date.lastWeek': 'الأسبوع الماضي',
    'date.thisMonth': 'هذا الشهر',
    'date.lastMonth': 'الشهر الماضي',
    'time.minutesAgo': 'منذ {count} دقيقة',
    'time.hoursAgo': 'منذ {count} ساعة',
    'time.daysAgo': 'منذ {count} يوم',
    'time.justNow': 'الآن',
    
    // User Roles
    'role.admin': 'مدير',
    'role.hr': 'موارد بشرية',
    'role.manager': 'مدير',
    'role.employee': 'موظف',
    
    // Status
    'status.active': 'نشط',
    'status.inactive': 'غير نشط',
    'status.pending': 'في انتظار',
    'status.completed': 'مكتمل',
    'status.inProgress': 'قيد التنفيذ',
    'status.draft': 'مسودة',
    'status.published': 'منشور',
    'status.archived': 'مؤرشف'
  }
}

interface LanguageProviderProps {
  children: ReactNode
  defaultLanguage?: Language
  storageKey?: string
}

export function LanguageProvider({ 
  children, 
  defaultLanguage = 'en',
  storageKey = 'empty-space-hr-language'
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      return (stored as Language) || defaultLanguage
    }
    return defaultLanguage
  })

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    localStorage.setItem(storageKey, language)
    document.documentElement.setAttribute('dir', direction)
    document.documentElement.setAttribute('lang', language)
  }, [language, direction, storageKey])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue))
      })
    }
    
    return translation
  }

  const value = {
    language,
    setLanguage,
    direction,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}