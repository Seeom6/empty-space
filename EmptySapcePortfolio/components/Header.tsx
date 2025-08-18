import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Menu, X, Sun, Moon, Languages } from 'lucide-react'
import { useLanguage } from './LanguageContext'
// import logoImage from 'figma:asset/1250f8ec5c6291a8422b9806d33f3f985086e618.png'

interface HeaderProps {
  isDark: boolean
  setIsDark: (isDark: boolean) => void
}

export function Header({ isDark, setIsDark }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: t('nav.home'), href: '#home' },
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.services'), href: '#services' },
    { name: t('nav.projects'), href: '#projects' },
    { name: t('nav.technologies'), href: '#technologies' },
    { name: t('nav.contact'), href: '#contact' }
  ]

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en')
  }

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)

    // Immediate visual feedback
    const root = document.documentElement
    if (newTheme) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-lg'
          : 'bg-transparent'
      } ${language === 'ar' ? 'font-arabic' : ''}`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => scrollToSection('#home')}
          >
            <div className="relative">
              <motion.div
                className="h-10 w-10 bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-center text-xl"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                🚀
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#3e4463] to-[#c43b8c] opacity-20 rounded-full blur-lg"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-[#3e4463] to-[#c43b8c] bg-clip-text text-transparent">
                Empty Space
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="text-foreground/80 hover:text-[#c43b8c] transition-colors duration-200 relative group"
                whileHover={{ y: -2 }}
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#3e4463] to-[#c43b8c] group-hover:w-full transition-all duration-300"></span>
              </motion.button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="relative group hover:bg-[#3e4463]/10"
            >
              <Languages className="h-5 w-5" />
              <span className="sr-only">Toggle language</span>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {language === 'en' ? 'العربية' : 'English'}
              </div>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative group hover:bg-[#3e4463]/10"
            >
              <motion.div
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-[#c43b8c]" />
                ) : (
                  <Moon className="h-5 w-5 text-[#3e4463]" />
                )}
              </motion.div>
              <span className="sr-only">Toggle theme</span>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {isDark ? 'Light mode' : 'Dark mode'}
              </div>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden hover:bg-[#3e4463]/10"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.div>
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? 'auto' : 0,
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="pt-6 pb-4 space-y-4">
            {navigation.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="block w-full text-left text-foreground/80 hover:text-[#c43b8c] transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-[#3e4463]/5"
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.name}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </nav>
    </motion.header>
  )
}