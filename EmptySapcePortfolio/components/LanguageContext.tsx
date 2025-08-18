import React, { createContext, useContext, useState, useEffect } from 'react'

interface LanguageContextType {
  language: 'en' | 'ar'
  setLanguage: (lang: 'en' | 'ar') => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.services': 'Services',
    'nav.projects': 'Our Projects',
    'nav.technologies': 'Technologies',
    'nav.contact': 'Contact',
    'nav.getInTouch': 'Get in Touch',
    
    // Hero Section
    'hero.title': 'We Build Scalable & Smart Software Solutions',
    'hero.subtitle': 'Transforming ideas into reality with cutting-edge technologies and innovative engineering solutions.',
    'hero.startProject': 'Start Your Project',
    'hero.viewWork': 'View Our Work',
    'hero.stats.projects': 'Projects Delivered',
    'hero.stats.clients': 'Happy Clients',
    'hero.stats.experience': 'Years Experience',
    
    // About Section
    'about.title': 'About Empty Space',
    'about.description': 'Empty Space is a leading software company providing innovative solutions for enterprises and startups. We transform complex challenges into elegant, scalable software that drives business success.',
    'about.innovation.title': 'Innovation',
    'about.innovation.description': 'We leverage cutting-edge technologies to create innovative solutions that drive business growth.',
    'about.scalability.title': 'Scalability',
    'about.scalability.description': 'Our solutions are designed to grow with your business, ensuring long-term success and adaptability.',
    'about.security.title': 'Security',
    'about.security.description': 'We prioritize security at every level, implementing robust measures to protect your data and systems.',
    
    // Services Section
    'services.title': 'Our Services',
    'services.description': 'We offer comprehensive software development services to help businesses thrive in the digital age.',
    'services.web.title': 'Web Development',
    'services.web.description': 'Modern, responsive web applications built with cutting-edge technologies for optimal performance.',
    'services.mobile.title': 'Mobile App Development',
    'services.mobile.description': 'Native and cross-platform mobile applications that deliver exceptional user experiences.',
    'services.design.title': 'UI/UX Design',
    'services.design.description': 'User-centered design solutions that combine aesthetics with functionality for maximum impact.',
    'services.enterprise.title': 'Enterprise Solutions',
    'services.enterprise.description': 'Scalable enterprise systems that streamline operations and drive business growth.',
    'services.cloud.title': 'Cloud & DevOps',
    'services.cloud.description': 'Cloud infrastructure and DevOps solutions for reliable, scalable, and secure deployments.',
    'services.analytics.title': 'Analytics & Reporting',
    'services.analytics.description': 'Advanced analytics and reporting systems to help you make data-driven decisions.',
    
    // Projects Section
    'projects.title': 'Featured Projects',
    'projects.description': 'Explore our latest work and see how we transform business challenges into innovative solutions.',
    'projects.ems.title': 'Enterprise Management System',
    'projects.ems.description': 'A comprehensive enterprise solution that streamlines business operations with advanced features for authentication, role-based access control, HR management, project tracking, and real-time analytics.',
    'projects.features': 'Key Features:',
    'projects.technologies': 'Technologies:',
    'projects.liveDemo': 'View Project',
    'projects.viewCode': 'View Code',
    'projects.viewMore': 'View More Projects',
    'projects.feature.auth': 'Advanced Authentication & RBAC',
    'projects.feature.hr': 'Complete HR Management',
    'projects.feature.project': 'Project & Task Management',
    'projects.feature.analytics': 'Real-time Analytics Dashboard',
    
    // Technologies Section
    'technologies.title': 'Technologies We Use',
    'technologies.description': 'We leverage the latest and most reliable technologies to build robust, scalable solutions.',
    
    // Contact Section
    'contact.title': 'Get In Touch',
    'contact.description': 'Ready to start your next project? Let\'s discuss how we can help bring your ideas to life.',
    'contact.sendMessage': 'Send us a message',
    'contact.name': 'Name',
    'contact.namePlaceholder': 'Your name',
    'contact.email': 'Email',
    'contact.emailPlaceholder': 'your.email@example.com',
    'contact.message': 'Message',
    'contact.messagePlaceholder': 'Tell us about your project...',
    'contact.send': 'Send Message',
    'contact.phone': 'Phone',
    'contact.followUs': 'Follow Us',
    'contact.officeHours': 'Office Hours',
    'contact.hours.weekdays': 'Monday - Friday: 9:00 AM - 6:00 PM',
    'contact.hours.saturday': 'Saturday: 10:00 AM - 4:00 PM',
    'contact.hours.sunday': 'Sunday: Closed',
    
    // Footer
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact',
    'footer.copyright': '© 2025 Empty Space. All rights reserved. | Powered by Empty Space Technologies'
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.services': 'الخدمات',
    'nav.projects': 'مشاريعنا',
    'nav.technologies': 'التقنيات',
    'nav.contact': 'اتصل بنا',
    'nav.getInTouch': 'تواصل معنا',
    
    // Hero Section
    'hero.title': 'نبني حلول برمجية ذكية وقابلة للتطوير',
    'hero.subtitle': 'نحول الأفكار إلى واقع باستخدام أحدث التقنيات والحلول الهندسية المبتكرة.',
    'hero.startProject': 'ابدأ مشروعك',
    'hero.viewWork': 'اطلع على أعمالنا',
    'hero.stats.projects': 'مشروع مُنجز',
    'hero.stats.clients': 'عميل راضٍ',
    'hero.stats.experience': 'سنوات خبرة',
    
    // About Section
    'about.title': 'حول Empty Space',
    'about.description': 'Empty Space هي شركة برمجيات رائدة تقدم حلولاً مبتكرة للمؤسسات والشركات الناشئة. نحن نحول التحديات المعقدة إلى برمجيات أنيقة وقابلة للتطوير تقود نجاح الأعمال.',
    'about.innovation.title': 'الابتكار',
    'about.innovation.description': 'نستفيد من أحدث التقنيات لإنشاء حلول مبتكرة تقود نمو الأعمال.',
    'about.scalability.title': 'قابلية التوسع',
    'about.scalability.description': 'حلولنا مصممة لتنمو مع عملك، مما يضمن النجاح على المدى الطويل وقابلية التكيف.',
    'about.security.title': 'الأمان',
    'about.security.description': 'نعطي الأولوية للأمان على كل المستويات، وننفذ تدابير قوية لحماية بياناتك وأنظمتك.',
    
    // Services Section
    'services.title': 'خدماتنا',
    'services.description': 'نقدم خدمات تطوير برمجيات شاملة لمساعدة الشركات على الازدهار في العصر الرقمي.',
    'services.web.title': 'تطوير الويب',
    'services.web.description': 'تطبيقات ويب حديثة ومتجاوبة مبنية بأحدث التقنيات للحصول على أداء مثالي.',
    'services.mobile.title': 'تطوير تطبيقات الهاتف',
    'services.mobile.description': 'تطبيقات هاتف أصلية ومتعددة المنصات تقدم تجارب استخدام استثنائية.',
    'services.design.title': 'تصميم UI/UX',
    'services.design.description': 'حلول تصميم محورها المستخدم تجمع بين الجماليات والوظائف لتحقيق أقصى تأثير.',
    'services.enterprise.title': 'الحلول المؤسسية',
    'services.enterprise.description': 'أنظمة مؤسسية قابلة للتطوير تبسط العمليات وتقود نمو الأعمال.',
    'services.cloud.title': 'السحابة و DevOps',
    'services.cloud.description': 'بنية تحتية سحابية وحلول DevOps للنشر الموثوق وقابل للتطوير والآمن.',
    'services.analytics.title': 'التحليلات والتقارير',
    'services.analytics.description': 'أنظمة تحليلات وتقارير متقدمة لمساعدتك في اتخاذ قرارات مدفوعة بالبيانات.',
    
    // Projects Section
    'projects.title': 'المشاريع المميزة',
    'projects.description': 'استكشف أحدث أعمالنا وشاهد كيف نحول تحديات الأعمال إلى حلول مبتكرة.',
    'projects.ems.title': 'نظام إدارة المؤسسات',
    'projects.ems.description': 'حل مؤسسي شامل يبسط عمليات الأعمال مع ميزات متقدمة للمصادقة والتحكم في الوصول القائم على الأدوار وإدارة الموارد البشرية وتتبع المشاريع والتحليلات في الوقت الفعلي.',
    'projects.features': 'الميزات الرئيسية:',
    'projects.technologies': 'التقنيات:',
    'projects.liveDemo': 'عرض المشروع',
    'projects.viewCode': 'عرض الكود',
    'projects.viewMore': 'عرض المزيد من المشاريع',
    'projects.feature.auth': 'مصادقة متقدمة و RBAC',
    'projects.feature.hr': 'إدارة الموارد البشرية الكاملة',
    'projects.feature.project': 'إدارة المشاريع والمهام',
    'projects.feature.analytics': 'لوحة التحليلات في الوقت الفعلي',
    
    // Technologies Section
    'technologies.title': 'التقنيات التي نستخدمها',
    'technologies.description': 'نستفيد من أحدث وأكثر التقنيات موثوقية لبناء حلول قوية وقابلة للتطوير.',
    
    // Contact Section
    'contact.title': 'تواصل معنا',
    'contact.description': 'مستعد لبدء مشروعك التالي؟ دعنا نناقش كيف يمكننا مساعدتك في تحقيق أفكارك.',
    'contact.sendMessage': 'أرسل لنا رسالة',
    'contact.name': 'الاسم',
    'contact.namePlaceholder': 'اسمك',
    'contact.email': 'البريد الإلكتروني',
    'contact.emailPlaceholder': 'your.email@example.com',
    'contact.message': 'الرسالة',
    'contact.messagePlaceholder': 'أخبرنا عن مشروعك...',
    'contact.send': 'إرسال الرسالة',
    'contact.phone': 'الهاتف',
    'contact.followUs': 'تابعنا',
    'contact.officeHours': 'ساعات العمل',
    'contact.hours.weekdays': 'الاثنين - الجمعة: 9:00 ص - 6:00 م',
    'contact.hours.saturday': 'السبت: 10:00 ص - 4:00 م',
    'contact.hours.sunday': 'الأحد: مغلق',
    
    // Footer
    'footer.quickLinks': 'روابط سريعة',
    'footer.contact': 'اتصل بنا',
    'footer.copyright': '© 2025 Empty Space. جميع الحقوق محفوظة. | مدعوم من Empty Space Technologies'
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'ar'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language')
      return (saved as 'en' | 'ar') || 'en'
    }
    return 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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