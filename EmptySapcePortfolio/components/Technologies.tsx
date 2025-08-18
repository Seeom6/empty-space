import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from './ui/badge'
import { useLanguage } from './LanguageContext'
import { TechIcon } from './TechIcon'

export function Technologies() {
  const { language, t } = useLanguage()

  const technologies = [
    { 
      name: 'React', 
      category: 'Frontend', 
      color: 'from-blue-400 to-cyan-400',
      description: 'Modern UI library'
    },
    { 
      name: 'Next.js', 
      category: 'Framework', 
      color: 'from-gray-600 to-gray-800',
      description: 'Full-stack React framework'
    },
    { 
      name: 'Nest.js', 
      category: 'Backend', 
      color: 'from-red-500 to-red-700',
      description: 'Scalable Node.js framework'
    },
    { 
      name: 'TailwindCSS', 
      category: 'Styling', 
      color: 'from-cyan-400 to-blue-500',
      description: 'Utility-first CSS framework'
    },
    { 
      name: 'TypeScript', 
      category: 'Language', 
      color: 'from-blue-600 to-blue-800',
      description: 'Typed JavaScript'
    },
    { 
      name: 'MongoDB', 
      category: 'Database', 
      color: 'from-green-500 to-green-700',
      description: 'NoSQL database'
    },
    { 
      name: 'Redis', 
      category: 'Cache', 
      color: 'from-red-600 to-red-800',
      description: 'In-memory data store'
    },
    { 
      name: 'Node.js', 
      category: 'Runtime', 
      color: 'from-green-400 to-green-600',
      description: 'JavaScript runtime'
    },
    { 
      name: 'Docker', 
      category: 'DevOps', 
      color: 'from-blue-500 to-blue-700',
      description: 'Containerization platform'
    },
    { 
      name: 'AWS', 
      category: 'Cloud', 
      color: 'from-orange-400 to-orange-600',
      description: 'Cloud computing services'
    },
    { 
      name: 'GraphQL', 
      category: 'API', 
      color: 'from-pink-500 to-purple-600',
      description: 'Query language for APIs'
    },
    { 
      name: 'PostgreSQL', 
      category: 'Database', 
      color: 'from-blue-700 to-indigo-800',
      description: 'Relational database'
    }
  ]

  return (
    <section id="technologies" className="py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(62, 68, 99, 0.05) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(196, 59, 140, 0.05) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(62, 68, 99, 0.05) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(196, 59, 140, 0.05) 75%)
          `,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 0 15px, 15px -15px, -15px 0px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#3e4463] to-[#c43b8c] bg-clip-text text-transparent">
            {t('technologies.title')}
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            {t('technologies.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#3e4463]/20 hover:border-[#c43b8c]/40">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative p-6 text-center">
                  {/* Tech Icon */}
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="mb-4 flex justify-center"
                  >
                    <div className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-[#3e4463]/20 group-hover:border-[#c43b8c]/40 transition-all duration-300 group-hover:shadow-lg">
                      <TechIcon name={tech.name} className="w-12 h-12" />
                    </div>
                  </motion.div>

                  {/* Tech Name */}
                  <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#3e4463] group-hover:to-[#c43b8c] group-hover:bg-clip-text transition-all duration-300">
                    {tech.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-foreground/60 mb-3 group-hover:text-foreground/80 transition-colors duration-300">
                    {tech.description}
                  </p>

                  {/* Category Badge */}
                  <Badge 
                    variant="secondary" 
                    className={`bg-gradient-to-r ${tech.color} text-white border-0 group-hover:scale-105 transition-transform duration-200 shadow-sm`}
                  >
                    {tech.category}
                  </Badge>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#3e4463]/5 to-[#c43b8c]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Floating Animation Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + i * 8}%`,
              }}
            >
              <div className="w-1 h-1 bg-[#3e4463]/30 rounded-full" />
            </motion.div>
          ))}
        </div>

        {/* Tech Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto`}
        >
          {[
            { number: '12+', label: language === 'ar' ? 'تقنيات حديثة' : 'Modern Technologies' },
            { number: '5+', label: language === 'ar' ? 'سنوات خبرة' : 'Years Experience' },
            { number: '100+', label: language === 'ar' ? 'مشروع' : 'Projects Built' },
            { number: '99%', label: language === 'ar' ? 'معدل النجاح' : 'Success Rate' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 rounded-xl bg-card/60 backdrop-blur-sm border border-[#3e4463]/20 hover:border-[#c43b8c]/40 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#3e4463] to-[#c43b8c] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors duration-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}