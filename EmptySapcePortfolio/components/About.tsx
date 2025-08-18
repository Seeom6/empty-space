import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, TrendingUp } from 'lucide-react'
import { Card } from './ui/card'
import { useLanguage } from './LanguageContext'

export function About() {
  const { language, t } = useLanguage()

  const values = [
    {
      icon: Zap,
      title: { en: 'Innovation', ar: 'الابتكار' },
      description: { 
        en: 'We leverage cutting-edge technologies to create innovative solutions that drive business growth.',
        ar: 'نستفيد من أحدث التقنيات لإنشاء حلول مبتكرة تدفع نمو الأعمال.'
      },
      color: 'from-[#3e4463] to-[#4a5078]'
    },
    {
      icon: TrendingUp,
      title: { en: 'Scalability', ar: 'قابلية التوسع' },
      description: { 
        en: 'Our solutions are designed to grow with your business, ensuring long-term success and adaptability.',
        ar: 'تم تصميم حلولنا لتنمو مع أعمالك، مما يضمن النجاح والتكيف على المدى الطويل.'
      },
      color: 'from-[#c43b8c] to-[#d048a0]'
    },
    {
      icon: Shield,
      title: { en: 'Security', ar: 'الأمان' },
      description: { 
        en: 'We prioritize security at every level, implementing robust measures to protect your data and systems.',
        ar: 'نحن نعطي الأولوية للأمان على كل مستوى، وننفذ تدابير قوية لحماية بياناتك وأنظمتك.'
      },
      color: 'from-[#3e4463] to-[#c43b8c]'
    }
  ]

  return (
    <section id="about" className="py-20 bg-secondary/30" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#3e4463] to-[#c43b8c] bg-clip-text text-transparent">
            {t('about.title')}
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            {t('about.description')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title.en}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 group hover:scale-105 bg-card/50 backdrop-blur-sm border-2 hover:border-[#c43b8c]/20 relative overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg relative z-10`}
                >
                  <value.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[#c43b8c] transition-colors relative z-10">
                  {value.title[language]}
                </h3>
                <p className="text-foreground/70 leading-relaxed relative z-10">
                  {value.description[language]}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}