import React from 'react'
import { motion } from 'framer-motion'
import { Monitor, Smartphone, Palette, Building, Cloud, BarChart3 } from 'lucide-react'
import { Card } from './ui/card'

export function Services() {
  const services = [
    {
      icon: Monitor,
      title: 'Web Development',
      description: 'Modern, responsive web applications built with cutting-edge technologies for optimal performance.',
      color: 'from-[#3e4463] to-[#4a5078]'
    },
    {
      icon: Smartphone,
      title: 'Mobile App Development',
      description: 'Native and cross-platform mobile applications that deliver exceptional user experiences.',
      color: 'from-[#c43b8c] to-[#d048a0]'
    },
    {
      icon: Palette,
      title: 'UI/UX Design',
      description: 'User-centered design solutions that combine aesthetics with functionality for maximum impact.',
      color: 'from-[#3e4463] to-[#c43b8c]'
    },
    {
      icon: Building,
      title: 'Enterprise Solutions',
      description: 'Scalable enterprise systems that streamline operations and drive business growth.',
      color: 'from-[#4a5078] to-[#3e4463]'
    },
    {
      icon: Cloud,
      title: 'Cloud & DevOps',
      description: 'Cloud infrastructure and DevOps solutions for reliable, scalable, and secure deployments.',
      color: 'from-[#d048a0] to-[#c43b8c]'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Advanced analytics and reporting systems to help you make data-driven decisions.',
      color: 'from-[#c43b8c] to-[#3e4463]'
    }
  ]

  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#3e4463] to-[#c43b8c] bg-clip-text text-transparent">
            Our Services
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            We offer comprehensive software development services to help businesses thrive in the digital age.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="p-6 h-full hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 hover:border-[#c43b8c]/30 bg-card/70 backdrop-blur-sm relative overflow-hidden">
                {/* Background Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg relative z-10`}
                >
                  <service.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-[#c43b8c] transition-colors relative z-10">
                  {service.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed relative z-10">
                  {service.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}