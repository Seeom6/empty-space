import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { ArrowDown, Sparkles, Zap, Code } from 'lucide-react'
import { useLanguage } from './LanguageContext'

export function Hero() {
  const { language, t } = useLanguage()
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Circuit elements
    const nodes: Array<{
      x: number
      y: number
      connected: boolean
      pulsePhase: number
    }> = []

    const connections: Array<{
      from: { x: number; y: number }
      to: { x: number; y: number }
      active: boolean
      electrons: Array<{ progress: number; speed: number }>
    }> = []

    // Generate circuit nodes
    const gridSize = 80
    for (let x = gridSize; x < canvas.width - gridSize; x += gridSize) {
      for (let y = gridSize; y < canvas.height - gridSize; y += gridSize) {
        if (Math.random() > 0.6) {
          nodes.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            connected: false,
            pulsePhase: Math.random() * Math.PI * 2
          })
        }
      }
    }

    // Generate connections
    nodes.forEach((node, index) => {
      const nearbyNodes = nodes.filter((other, otherIndex) => {
        if (otherIndex === index) return false
        const distance = Math.sqrt(
          Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2)
        )
        return distance < gridSize * 1.5 && Math.random() > 0.7
      })

      nearbyNodes.forEach(nearbyNode => {
        connections.push({
          from: { x: node.x, y: node.y },
          to: { x: nearbyNode.x, y: nearbyNode.y },
          active: Math.random() > 0.5,
          electrons: []
        })
      })
    })

    // Add electrons to active connections
    connections.forEach(connection => {
      if (connection.active && Math.random() > 0.8) {
        connection.electrons.push({
          progress: 0,
          speed: 0.005 + Math.random() * 0.01
        })
      }
    })

    // Floating particles
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      color: string
    }> = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.5 ? '#3e4463' : '#c43b8c'
      })
    }

    let animationFrame = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      animationFrame++

      // Draw connections
      connections.forEach(connection => {
        if (connection.active) {
          // Draw connection line
          ctx.strokeStyle = `rgba(62, 68, 99, ${0.3 + Math.sin(animationFrame * 0.01) * 0.2})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(connection.from.x, connection.from.y)
          ctx.lineTo(connection.to.x, connection.to.y)
          ctx.stroke()

          // Draw electrons
          connection.electrons.forEach((electron, electronIndex) => {
            electron.progress += electron.speed
            
            if (electron.progress > 1) {
              electron.progress = 0
            }

            const x = connection.from.x + (connection.to.x - connection.from.x) * electron.progress
            const y = connection.from.y + (connection.to.y - connection.from.y) * electron.progress

            ctx.save()
            ctx.shadowBlur = 10
            ctx.shadowColor = '#3e4463'
            ctx.fillStyle = '#3e4463'
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
          })
        }
      })

      // Draw nodes
      nodes.forEach(node => {
        node.pulsePhase += 0.02
        const pulseSize = 2 + Math.sin(node.pulsePhase) * 1
        
        ctx.save()
        ctx.shadowBlur = 8
        ctx.shadowColor = '#c43b8c'
        ctx.fillStyle = '#c43b8c'
        ctx.beginPath()
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Outer glow
        ctx.fillStyle = `rgba(196, 59, 140, ${0.3 + Math.sin(node.pulsePhase) * 0.2})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, pulseSize + 3, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw and animate particles
      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        
        // Wrap around edges
        if (particle.x > canvas.width) particle.x = 0
        if (particle.x < 0) particle.x = canvas.width
        if (particle.y > canvas.height) particle.y = 0
        if (particle.y < 0) particle.y = canvas.height

        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Circuit Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
      />

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3e4463]/10 via-background to-[#c43b8c]/10" />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
            }}
          >
            {i % 3 === 0 ? (
              <Sparkles className="w-6 h-6 text-[#3e4463]/40" />
            ) : i % 3 === 1 ? (
              <Zap className="w-5 h-5 text-[#c43b8c]/40" />
            ) : (
              <Code className="w-4 h-4 text-[#3e4463]/40" />
            )}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 1, -1, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#3e4463] to-[#c43b8c] rounded-2xl flex items-center justify-center shadow-2xl">
                  <Code className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#3e4463] to-[#c43b8c] opacity-30 rounded-2xl blur-xl scale-110"></div>
              </div>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#3e4463] via-[#5a6b8d] to-[#c43b8c] bg-clip-text text-transparent">
                {t('hero.title')}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#3e4463] to-[#c43b8c] hover:from-[#4a5078] hover:to-[#d048a0] text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => scrollToSection('#projects')}
            >
              <motion.span
                whileHover={{ x: language === 'ar' ? -5 : 5 }}
                className="flex items-center"
              >
                {t('hero.cta.primary')}
                <Sparkles className={`w-5 h-5 ${language === 'ar' ? 'mr-2' : 'ml-2'} group-hover:scale-110 transition-transform duration-300`} />
              </motion.span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-[#3e4463]/30 hover:border-[#c43b8c]/50 hover:bg-[#c43b8c]/10 px-8 py-6 text-lg group"
              onClick={() => scrollToSection('#about')}
            >
              <motion.span
                whileHover={{ x: language === 'ar' ? -5 : 5 }}
                className="flex items-center"
              >
                {t('hero.cta.secondary')}
                <ArrowDown className={`w-5 h-5 ${language === 'ar' ? 'mr-2' : 'ml-2'} group-hover:scale-110 transition-transform duration-300`} />
              </motion.span>
            </Button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { number: '100+', label: t('hero.stats.projects') },
              { number: '50+', label: t('hero.stats.clients') },
              { number: '5+', label: t('hero.stats.years') },
              { number: '99%', label: t('hero.stats.satisfaction') }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 rounded-xl bg-card/60 backdrop-blur-sm border border-[#3e4463]/20 hover:border-[#c43b8c]/40 transition-all duration-300 hover:shadow-lg group"
              >
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#3e4463] to-[#c43b8c] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors duration-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="cursor-pointer"
          onClick={() => scrollToSection('#about')}
        >
          <div className="w-8 h-12 border-2 border-[#3e4463]/50 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              className="w-1 h-3 bg-gradient-to-b from-[#3e4463] to-[#c43b8c] rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}