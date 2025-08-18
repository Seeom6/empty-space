import { ProjectData } from './ProjectModal'

export const projectsData: ProjectData[] = [
  {
    id: 'enterprise-management',
    title: {
      en: 'Enterprise Management System',
      ar: 'نظام إدارة المؤسسات'
    },
    description: {
      en: 'Comprehensive enterprise solution for business operations',
      ar: 'حل مؤسسي شامل لعمليات الأعمال'
    },
    longDescription: {
      en: 'A comprehensive enterprise management system that streamlines business operations with advanced features for authentication, role-based access control, HR management, project tracking, and real-time analytics. Built with modern technologies to ensure scalability, security, and optimal performance.',
      ar: 'نظام إدارة مؤسسي شامل يبسط عمليات الأعمال مع ميزات متقدمة للمصادقة والتحكم في الوصول القائم على الأدوار وإدارة الموارد البشرية وتتبع المشاريع والتحليلات في الوقت الفعلي. مبني بأحدث التقنيات لضمان قابلية التوسع والأمان والأداء الأمثل.'
    },
    images: [
      'https://images.unsplash.com/photo-1592773307163-962d25055c3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkYXNoYm9hcmQlMjBpbnRlcmZhY2UlMjBkZXNpZ258ZW58MXx8fHwxNzU0NDk2MDU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1599945438072-034999a1b250?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBhcHBsaWNhdGlvbiUyMGFuYWx5dGljcyUyMGRhc2hib2FyZHxlbnwxfHx8fDE3NTQ0OTYwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    technologies: ['Next.js', 'TypeScript', 'TailwindCSS', 'Nest.js', 'MongoDB', 'Redis'],
    features: {
      en: [
        'Advanced Authentication & Role-Based Access Control',
        'Complete HR Management with Employee Profiles',
        'Project & Task Management with Real-time Updates',
        'Real-time Analytics Dashboard with Custom Reports',
        'Document Management & File Sharing',
        'Automated Workflow & Approval Processes',
        'Multi-language Support (EN/AR)',
        'Mobile-responsive Design'
      ],
      ar: [
        'مصادقة متقدمة والتحكم في الوصول القائم على الأدوار',
        'إدارة الموارد البشرية الكاملة مع ملفات تعريف الموظفين',
        'إدارة المشاريع والمهام مع التحديثات في الوقت الفعلي',
        'لوحة التحليلات في الوقت الفعلي مع التقارير المخصصة',
        'إدارة المستندات ومشاركة الملفات',
        'سير العمل الآلي وعمليات الموافقة',
        'دعم متعدد اللغات (إنجليزي/عربي)',
        'تصميم متجاوب للهاتف المحمول'
      ]
    },
    details: {
      duration: { en: '8 months', ar: '8 أشهر' },
      team: { en: '6 developers', ar: '6 مطورين' },
      client: { en: 'Fortune 500 Company', ar: 'شركة فورتشن 500' },
      status: { en: 'Live & Deployed', ar: 'مباشر ومنشور' }
    },
    links: {
      live: 'https://ems-demo.emptyspace.dev',
      github: 'https://github.com/emptyspace/ems'
    },
    stats: {
      users: '10K+',
      performance: '98%',
      uptime: '99.9%'
    }
  },
  {
    id: 'ecommerce-platform',
    title: {
      en: 'E-Commerce Platform',
      ar: 'منصة التجارة الإلكترونية'
    },
    description: {
      en: 'Modern e-commerce solution with AI-powered recommendations',
      ar: 'حل تجارة إلكترونية حديث مع توصيات مدعومة بالذكاء الاصطناعي'
    },
    longDescription: {
      en: 'A cutting-edge e-commerce platform featuring AI-powered product recommendations, advanced inventory management, multi-vendor support, and seamless payment integration. Built for scalability and optimized for conversion rates.',
      ar: 'منصة تجارة إلكترونية متطورة تتميز بتوصيات المنتجات المدعومة بالذكاء الاصطناعي وإدارة المخزون المتقدمة ودعم متعدد البائعين وتكامل الدفع السلس. مبنية للقابلية للتوسع ومحسنة لمعدلات التحويل.'
    },
    images: [
      'https://images.unsplash.com/photo-1656264142377-22ae3fefdbc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjB3ZWJzaXRlJTIwaW50ZXJmYWNlfGVufDF8fHx8MTc1NDQ5NjA3MHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'GraphQL', 'Docker', 'AWS'],
    features: {
      en: [
        'AI-Powered Product Recommendations',
        'Advanced Search & Filtering',
        'Multi-Vendor Marketplace Support',
        'Real-time Inventory Management',
        'Secure Payment Gateway Integration',
        'Order Tracking & Management',
        'Customer Reviews & Ratings',
        'Mobile-First Responsive Design'
      ],
      ar: [
        'توصيات المنتجات المدعومة بالذكاء الاصطناعي',
        'البحث والتصفية المتقدمة',
        'دعم سوق متعدد البائعين',
        'إدارة المخزون في الوقت الفعلي',
        'تكامل بوابة الدفع الآمنة',
        'تتبع وإدارة الطلبات',
        'تقييمات وآراء العملاء',
        'تصميم متجاوب يركز على الهاتف المحمول'
      ]
    },
    details: {
      duration: { en: '6 months', ar: '6 أشهر' },
      team: { en: '5 developers', ar: '5 مطورين' },
      client: { en: 'Retail Startup', ar: 'شركة تجزئة ناشئة' },
      status: { en: 'In Development', ar: 'قيد التطوير' }
    },
    links: {
      live: 'https://shop-demo.emptyspace.dev',
      github: 'https://github.com/emptyspace/ecommerce'
    },
    stats: {
      users: '5K+',
      performance: '95%',
      uptime: '99.5%'
    }
  },
  {
    id: 'mobile-fitness-app',
    title: {
      en: 'Fitness Mobile App',
      ar: 'تطبيق اللياقة البدنية للهاتف'
    },
    description: {
      en: 'Cross-platform fitness app with workout tracking and nutrition',
      ar: 'تطبيق لياقة بدنية متعدد المنصات مع تتبع التمارين والتغذية'
    },
    longDescription: {
      en: 'A comprehensive cross-platform mobile fitness application featuring personalized workout plans, nutrition tracking, progress analytics, and social features. Built with React Native for iOS and Android with real-time synchronization.',
      ar: 'تطبيق لياقة بدنية شامل متعدد المنصات يتميز بخطط التمرين المخصصة وتتبع التغذية وتحليلات التقدم والميزات الاجتماعية. مبني بـ React Native لنظامي iOS و Android مع المزامنة في الوقت الفعلي.'
    },
    images: [
      'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBpbnRlcmZhY2UlMjBkZXNpZ258ZW58MXx8fHwxNzU0NDY4OTE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    technologies: ['React', 'React Native', 'TypeScript', 'Node.js', 'MongoDB', 'Firebase'],
    features: {
      en: [
        'Personalized Workout Plans',
        'Nutrition & Calorie Tracking',
        'Progress Analytics & Reports',
        'Social Features & Challenges',
        'Wearable Device Integration',
        'Offline Mode Support',
        'Video Exercise Demonstrations',
        'Goal Setting & Achievement Tracking'
      ],
      ar: [
        'خطط التمرين المخصصة',
        'تتبع التغذية والسعرات الحرارية',
        'تحليلات وتقارير التقدم',
        'الميزات الاجتماعية والتحديات',
        'تكامل الأجهزة القابلة للارتداء',
        'دعم الوضع غير المتصل',
        'عروض فيديو للتمارين',
        'تحديد الأهداف وتتبع الإنجازات'
      ]
    },
    details: {
      duration: { en: '10 months', ar: '10 أشهر' },
      team: { en: '4 developers', ar: '4 مطورين' },
      client: { en: 'Health & Wellness Startup', ar: 'شركة صحة ولياقة ناشئة' },
      status: { en: 'Beta Testing', ar: 'اختبار تجريبي' }
    },
    links: {
      github: 'https://github.com/emptyspace/fitness-app'
    },
    stats: {
      users: '2K+',
      performance: '94%',
      uptime: '99.2%'
    }
  }
]