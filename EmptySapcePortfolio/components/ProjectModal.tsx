import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { 
  X, 
  ExternalLink, 
  Github, 
  Calendar, 
  Users, 
  Code, 
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useLanguage } from './LanguageContext'
import { TechIcon } from './TechIcon'
import { ImageWithFallback } from './figma/ImageWithFallback'

export interface ProjectData {
  id: string
  title: { en: string; ar: string }
  description: { en: string; ar: string }
  longDescription: { en: string; ar: string }
  images: string[]
  technologies: string[]
  features: { en: string[]; ar: string[] }
  details: {
    duration: { en: string; ar: string }
    team: { en: string; ar: string }
    client: { en: string; ar: string }
    status: { en: string; ar: string }
  }
  links: {
    live?: string
    github?: string
  }
  stats: {
    users: string
    performance: string
    uptime: string
  }
}

interface ProjectModalProps {
  project: ProjectData | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const { language, t } = useLanguage()
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

  if (!project) return null

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % project.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-card/95 backdrop-blur-xl border-2 border-[#3e4463]/30 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {project.title[language]}
          </DialogTitle>
          <DialogDescription>
            {project.description[language]}
          </DialogDescription>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="h-full flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3e4463] to-[#c43b8c] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {project.title[language]}
                </h2>
                <p className="text-white/80">
                  {project.description[language]}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
                aria-label="Close dialog"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid lg:grid-cols-2 gap-0 h-full">
              {/* Left Side - Images and Gallery */}
              <div className="bg-gradient-to-br from-background/50 to-background/80 p-8">
                <div className="space-y-6">
                  {/* Main Image Display */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <div className="aspect-video relative bg-gradient-to-br from-[#3e4463]/20 to-[#c43b8c]/20">
                      <ImageWithFallback
                        src={project.images[currentImageIndex]}
                        alt={`${project.title[language]} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Image Navigation */}
                      {project.images.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </Button>
                        </>
                      )}

                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {project.images.length}
                      </div>
                    </div>
                  </div>

                  {/* Image Thumbnails */}
                  {project.images.length > 1 && (
                    <div className="flex space-x-3 overflow-x-auto pb-2">
                      {project.images.map((image, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            index === currentImageIndex
                              ? 'border-[#c43b8c] shadow-lg'
                              : 'border-border hover:border-[#3e4463]/50'
                          }`}
                          aria-label={`View image ${index + 1}`}
                        >
                          <ImageWithFallback
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Project Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Users', value: project.stats.users, icon: Users },
                      { label: 'Performance', value: project.stats.performance, icon: Zap },
                      { label: 'Uptime', value: project.stats.uptime, icon: Code }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-[#3e4463]/20"
                      >
                        <stat.icon className="w-6 h-6 mx-auto mb-2 text-[#c43b8c]" />
                        <div className="font-bold text-lg text-foreground">{stat.value}</div>
                        <div className="text-sm text-foreground/60">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Project Details */}
              <div className="p-8 space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#3e4463] to-[#c43b8c] bg-clip-text text-transparent">
                    {language === 'ar' ? 'نظرة عامة' : 'Overview'}
                  </h3>
                  <p className="text-foreground/80 leading-relaxed">
                    {project.longDescription[language]}
                  </p>
                </div>

                {/* Technologies */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    {language === 'ar' ? 'التقنيات المستخدمة' : 'Technologies Used'}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {project.technologies.map((tech, index) => (
                      <motion.div
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                      >
                        <Badge 
                          variant="secondary" 
                          className="px-3 py-2 bg-background/50 border border-[#3e4463]/20 hover:border-[#c43b8c]/40 transition-all duration-200 flex items-center space-x-2"
                        >
                          <TechIcon name={tech} className="w-4 h-4" />
                          <span>{tech}</span>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    {language === 'ar' ? 'الميزات الرئيسية' : 'Key Features'}
                  </h3>
                  <div className="space-y-3">
                    {project.features[language].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-[#3e4463] to-[#c43b8c] rounded-full" />
                        <span className="text-foreground/80">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    {language === 'ar' ? 'تفاصيل المشروع' : 'Project Details'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: language === 'ar' ? 'المدة' : 'Duration', value: project.details.duration[language], icon: Calendar },
                      { label: language === 'ar' ? 'الفريق' : 'Team', value: project.details.team[language], icon: Users },
                      { label: language === 'ar' ? 'العميل' : 'Client', value: project.details.client[language], icon: Code },
                      { label: language === 'ar' ? 'الحالة' : 'Status', value: project.details.status[language], icon: Zap }
                    ].map((detail, index) => (
                      <motion.div
                        key={detail.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-[#3e4463]/20"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <detail.icon className="w-4 h-4 text-[#c43b8c]" />
                          <span className="text-sm font-medium text-foreground/70">{detail.label}</span>
                        </div>
                        <span className="text-foreground">{detail.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex flex-col sm:flex-row gap-4 pt-4 ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
                  {project.links.live && (
                    <Button 
                      className="bg-gradient-to-r from-[#3e4463] to-[#c43b8c] hover:from-[#4a5078] hover:to-[#d048a0] text-white group flex-1"
                      onClick={() => window.open(project.links.live, '_blank')}
                    >
                      <ExternalLink className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform duration-200`} />
                      {language === 'ar' ? 'عرض مباشر' : 'Live Demo'}
                    </Button>
                  )}
                  {project.links.github && (
                    <Button 
                      variant="outline" 
                      className="border-[#3e4463]/30 hover:border-[#c43b8c]/50 hover:bg-[#c43b8c]/10 group flex-1"
                      onClick={() => window.open(project.links.github, '_blank')}
                    >
                      <Github className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform duration-200`} />
                      {language === 'ar' ? 'عرض الكود' : 'View Code'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}