'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { About } from '../components/About'
import { Services } from '../components/Services'
import { Projects } from '../components/Projects'
import { Technologies } from '../components/Technologies'
import { Contact } from '../components/Contact'
import { Footer } from '../components/Footer'
import { ThemeScript } from '../components/ThemeScript'
import { LanguageProvider } from '../components/LanguageContext'

export default function HomePage() {
  const [isDark, setIsDark] = useState(true) // Default to dark mode
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Get saved preference or default to dark
    const savedTheme = localStorage.getItem('darkMode')
    const prefersDark = savedTheme !== null ? JSON.parse(savedTheme) : true

    // Check if the current DOM state matches what we expect
    const isDarkClass = document.documentElement.classList.contains('dark')

    // Sync state with DOM - only if theme script hasn't already handled it
    setIsDark(prefersDark)

    // Ensure DOM is in sync only if needed
    if (!window.__themeInitialized) {
      if (prefersDark && !isDarkClass) {
        document.documentElement.classList.add('dark')
      } else if (!prefersDark && isDarkClass) {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDark))

    // Apply theme class with transition
    const root = document.documentElement

    // Add transition class for smooth theme change
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease'

    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Remove transition after a short delay to avoid affecting other animations
    setTimeout(() => {
      root.style.transition = ''
    }, 300)
  }, [isDark, mounted])

  return (
    <LanguageProvider>
      <ThemeScript />
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Header isDark={isDark} setIsDark={setIsDark} />
        <Hero />
        <About />
        <Services />
        <Projects />
        <Technologies />
        <Contact />
        <Footer />
      </div>
    </LanguageProvider>
  )
}
