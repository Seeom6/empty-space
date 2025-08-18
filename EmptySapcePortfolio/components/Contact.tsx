import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent } from './ui/card'
import { Mail, Phone, MapPin, Send, Star, Rocket, Globe, Zap } from 'lucide-react'
import { useLanguage } from './LanguageContext'

export function Contact() {
  const { language, t } = useLanguage()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  // Cosmic background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Stars system
    const stars: Array<{
      x: number
      y: number
      size: number
      opacity: number
      twinkleSpeed: number
      twinklePhase: number
    }> = []

    // Create stars
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      })
    }

    // Cosmic nebula clouds
    const nebulas: Array<{
      x: number
      y: number
      size: number
      color: string
      drift: number
    }> = []

    for (let i = 0; i < 5; i++) {
      nebulas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 200 + 100,
        color: i % 2 === 0 ? 'rgba(62, 68, 99, 0.1)' : 'rgba(196, 59, 140, 0.1)',
        drift: Math.random() * 0.5 + 0.2
      })
    }

    let animationFrame = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      animationFrame++

      // Draw nebulas
      nebulas.forEach(nebula => {
        nebula.x += nebula.drift * Math.sin(animationFrame * 0.001)
        nebula.y += nebula.drift * Math.cos(animationFrame * 0.001)

        // Wrap around
        if (nebula.x > canvas.width + nebula.size) nebula.x = -nebula.size
        if (nebula.y > canvas.height + nebula.size) nebula.y = -nebula.size
        if (nebula.x < -nebula.size) nebula.x = canvas.width + nebula.size
        if (nebula.y < -nebula.size) nebula.y = canvas.height + nebula.size

        const gradient = ctx.createRadialGradient(
          nebula.x, nebula.y, 0,
          nebula.x, nebula.y, nebula.size
        )
        gradient.addColorStop(0, nebula.color)
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.fillRect(
          nebula.x - nebula.size,
          nebula.y - nebula.size,
          nebula.size * 2,
          nebula.size * 2
        )
      })

      // Draw stars with twinkling
      stars.forEach(star => {
        star.twinklePhase += star.twinkleSpeed
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7
        
        ctx.save()
        ctx.globalAlpha = star.opacity * twinkle
        
        // Draw star
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Add glow for larger stars
        if (star.size > 1.5) {
          ctx.shadowBlur = 10
          ctx.shadowColor = '#ffffff'
          ctx.fill()
        }
        
        ctx.restore()
      })

      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <section id="contact" className="py-20 relative overflow-hidden min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Cosmic Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Floating Planets */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#3e4463] to-[#c43b8c] opacity-30 blur-sm"
        />
        
        <motion.div
          animate={{
            rotate: -360,
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
          className="absolute top-1/3 right-16 w-32 h-32 rounded-full bg-gradient-to-tl from-[#c43b8c] to-[#3e4463] opacity-20 blur-md"
        />

        <motion.div
          animate={{
            rotate: 180,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-1/4 w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-25 blur-sm"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#3e4463] to-[#c43b8c] rounded-full flex items-center justify-center shadow-2xl">
              <Rocket className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#3e4463] via-white to-[#c43b8c] bg-clip-text text-transparent">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            {t('contact.description')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Contact Form - Spaceship Design */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden border-2 border-[#3e4463]/30 hover:border-[#c43b8c]/50 transition-all duration-500 bg-card/20 backdrop-blur-lg shadow-2xl">
              {/* Spaceship Panel Header */}
              <div className="bg-gradient-to-r from-[#3e4463] to-[#c43b8c] p-6">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                  <Send className={`w-6 h-6 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                  {t('contact.sendMessage')}
                </h3>
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                      className="w-3 h-3 rounded-full bg-white/60"
                    />
                  ))}
                </div>
              </div>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <label className="block text-sm font-medium mb-2 text-foreground/80">
                      {t('contact.name')}
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('contact.namePlaceholder')}
                      className="bg-background/50 border-[#3e4463]/30 focus:border-[#c43b8c]/50 backdrop-blur-sm transition-all duration-300 hover:bg-background/70"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <label className="block text-sm font-medium mb-2 text-foreground/80">
                      {t('contact.email')}
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('contact.emailPlaceholder')}
                      className="bg-background/50 border-[#3e4463]/30 focus:border-[#c43b8c]/50 backdrop-blur-sm transition-all duration-300 hover:bg-background/70"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <label className="block text-sm font-medium mb-2 text-foreground/80">
                      {t('contact.message')}
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t('contact.messagePlaceholder')}
                      rows={5}
                      className="bg-background/50 border-[#3e4463]/30 focus:border-[#c43b8c]/50 backdrop-blur-sm transition-all duration-300 hover:bg-background/70 resize-none"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#3e4463] to-[#c43b8c] hover:from-[#4a5078] hover:to-[#d048a0] text-white py-6 text-lg group shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <motion.div
                        whileHover={{ x: language === 'ar' ? -5 : 5 }}
                        className="flex items-center justify-center"
                      >
                        <Rocket className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform duration-300`} />
                        {t('contact.send')}
                      </motion.div>
                    </Button>
                  </motion.div>
                </form>
              </CardContent>

              {/* Spaceship Details */}
              <div className="absolute top-4 right-4 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <div className="absolute top-4 right-10 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-500 shadow-lg shadow-blue-400/50"></div>
            </Card>
          </motion.div>

          {/* Contact Information - Space Station */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Main Contact Card */}
            <Card className="relative overflow-hidden border-2 border-[#3e4463]/30 hover:border-[#c43b8c]/50 transition-all duration-500 bg-card/20 backdrop-blur-lg shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {[
                    { icon: Mail, label: 'contact@emptyspace.dev', href: 'mailto:contact@emptyspace.dev' },
                    { icon: Phone, label: '+1 (555) 123-4567', href: 'tel:+15551234567' },
                    { icon: MapPin, label: 'San Francisco, CA', href: '#' }
                  ].map((item, index) => (
                    <motion.a
                      key={index}
                      href={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-background/30 backdrop-blur-sm border border-[#3e4463]/20 hover:border-[#c43b8c]/40 transition-all duration-300 group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-[#3e4463] to-[#c43b8c] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-foreground/80 group-hover:text-foreground transition-colors duration-300">
                        {item.label}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Office Hours - Mission Control */}
            <Card className="relative overflow-hidden border-2 border-[#3e4463]/30 hover:border-[#c43b8c]/50 transition-all duration-500 bg-card/20 backdrop-blur-lg shadow-2xl">
              <CardContent className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h4 className="text-xl font-bold mb-4 flex items-center text-foreground">
                    <Globe className={`w-6 h-6 ${language === 'ar' ? 'ml-3' : 'mr-3'} text-[#c43b8c]`} />
                    {t('contact.officeHours')}
                  </h4>
                  <div className="space-y-2 text-foreground/70">
                    <p>{t('contact.hours.weekdays')}</p>
                    <p>{t('contact.hours.saturday')}</p>
                    <p>{t('contact.hours.sunday')}</p>
                  </div>
                </motion.div>
              </CardContent>
              
              {/* Mission Status Indicator */}
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
                />
              </div>
            </Card>

            {/* Social Links - Satellite Network */}
            <Card className="relative overflow-hidden border-2 border-[#3e4463]/30 hover:border-[#c43b8c]/50 transition-all duration-500 bg-card/20 backdrop-blur-lg shadow-2xl">
              <CardContent className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  viewport={{ once: true }}
                >
                  <h4 className="text-xl font-bold mb-4 flex items-center text-foreground">
                    <Star className={`w-6 h-6 ${language === 'ar' ? 'ml-3' : 'mr-3'} text-[#c43b8c]`} />
                    {t('contact.followUs')}
                  </h4>
                  <div className="flex space-x-4">
                    {['GitHub', 'LinkedIn', 'Twitter', 'Discord'].map((platform, index) => (
                      <motion.button
                        key={platform}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-gradient-to-br from-[#3e4463] to-[#c43b8c] rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
                      >
                        <Zap className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
              style={{
                left: `${5 + i * 8}%`,
                top: `${10 + (i % 3) * 30}%`,
              }}
            >
              <Star className="w-4 h-4 text-[#c43b8c]/30" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}