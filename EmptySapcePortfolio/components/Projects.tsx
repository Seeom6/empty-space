import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { ExternalLink, Github, CheckCircle, Zap, Shield, BarChart3, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from './LanguageContext'
import { TechIcon } from './TechIcon'
import { ProjectModal, ProjectData } from './ProjectModal'
import { projectsData } from './projectsData'
import { ImageWithFallback } from './figma/ImageWithFallback'

export function Projects() {
  const { language, t } = useLanguage()
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)

  const openProjectModal = (project: ProjectData) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const closeProjectModal = () => {
    setIsModalOpen(false)
    setSelectedProject(null)
  }

  const nextProject = () => {
    setCurrentProjectIndex((prev) => (prev + 1) % projectsData.length)
  }

  const prevProject = () => {
    setCurrentProjectIndex((prev) => (prev - 1 + projectsData.length) % projectsData.length)
  }

  const currentProject = projectsData[currentProjectIndex]

  const features = [
    { icon: Shield, key: 'auth' },
    { icon: CheckCircle, key: 'hr' },
    { icon: Zap, key: 'project' },
    { icon: BarChart3, key: 'analytics' }
  ]

  return (
    <section id="projects" className="py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(62, 68, 99, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(196, 59, 140, 0.1) 0%, transparent 50%)
          `
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
            {t('projects.title')}
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            {t('projects.description')}
          </p>
        </motion.div>

        {/* Featured Project Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto mb-16"
        >
          <Card className="overflow-hidden border-2 border-[#3e4463]/20 hover:border-[#c43b8c]/30 transition-all duration-300 bg-card/80 backdrop-blur-sm">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Project Image/Preview */}
              <div className="relative bg-gradient-to-br from-[#3e4463] to-[#c43b8c] p-8 flex items-center justify-center min-h-[400px]">
                <motion.div
                  key={currentProject.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full max-w-md"
                >
                  {/* Project Preview */}
                  <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                    {/* Browser Header */}
                    <div className="bg-gray-200 p-3 flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-600">
                        {currentProject.links.live || 'preview.emptyspace.dev'}
                      </div>
                    </div>
                    
                    {/* Project Screenshot */}
                    <div className="aspect-video relative">
                      <ImageWithFallback
                        src={currentProject.images[0]}
                        alt={currentProject.title[language]}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    <Zap className="w-4 h-4 text-[#c43b8c]" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-4 -left-4 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    <CheckCircle className="w-3 h-3 text-[#3e4463]" />
                  </motion.div>
                </motion.div>

                {/* Project Navigation */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevProject}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextProject}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>

                {/* Project Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {currentProjectIndex + 1} / {projectsData.length}
                </div>
              </div>

              {/* Project Details */}
              <CardContent className="p-8 lg:p-12">
                <motion.div
                  key={currentProject.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#3e4463] to-[#c43b8c] bg-clip-text text-transparent">
                    {currentProject.title[language]}
                  </h3>
                  
                  <p className="text-foreground/70 mb-6 leading-relaxed">
                    {currentProject.description[language]}
                  </p>

                  {/* Features - Show only for EMS */}
                  {currentProject.id === 'enterprise-management' && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 text-foreground">
                        {t('projects.features')}
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {features.map((feature, index) => (
                          <motion.div
                            key={feature.key}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-center space-x-3 group"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-[#3e4463] to-[#c43b8c] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <feature.icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-foreground/80">
                              {t(`projects.feature.${feature.key}`)}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technologies */}
                  <div className="mb-8">
                    <h4 className="font-semibold mb-4 text-foreground">
                      {t('projects.technologies')}
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {currentProject.technologies.slice(0, 6).map((tech, index) => (
                        <motion.div
                          key={tech}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="group"
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

                  {/* Action Buttons */}
                  <div className={`flex flex-col sm:flex-row gap-4 ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
                    <Button 
                      onClick={() => openProjectModal(currentProject)}
                      className="bg-gradient-to-r from-[#3e4463] to-[#c43b8c] hover:from-[#4a5078] hover:to-[#d048a0] text-white group flex-1"
                    >
                      <Eye className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform duration-200`} />
                      {t('projects.liveDemo')}
                    </Button>
                    
                    {currentProject.links.github && (
                      <Button 
                        variant="outline" 
                        className="border-[#3e4463]/30 hover:border-[#c43b8c]/50 hover:bg-[#c43b8c]/10 group flex-1"
                        onClick={() => window.open(currentProject.links.github, '_blank')}
                      >
                        <Github className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform duration-200`} />
                        {t('projects.viewCode')}
                      </Button>
                    )}
                  </div>
                </motion.div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Project Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center space-x-3 mb-12"
        >
          {projectsData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentProjectIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentProjectIndex
                  ? 'bg-gradient-to-r from-[#3e4463] to-[#c43b8c] scale-125'
                  : 'bg-border hover:bg-[#3e4463]/30'
              }`}
            />
          ))}
        </motion.div>

        {/* View More Projects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-[#3e4463]/30 hover:border-[#c43b8c]/50 hover:bg-[#c43b8c]/10 px-8 py-4"
          >
            {t('projects.viewMore')}
          </Button>
        </motion.div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeProjectModal}
      />
    </section>
  )
}