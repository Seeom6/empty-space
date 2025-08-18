import React from 'react'
import { motion } from 'framer-motion'
import { Linkedin, Github, Twitter, ArrowUp } from 'lucide-react'
// import emptySpaceLogo from 'figma:asset/2d8e12df5569c66f787a5e69f756950ce6f94946.png'

export function Footer() {
  const quickLinks = [
    { href: '#home', label: 'Home' },
    { href: '#services', label: 'Services' },
    { href: '#projects', label: 'Projects' },
    { href: '#contact', label: 'Contact' }
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-center text-xl"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                🚀
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#3e4463] to-[#c43b8c] bg-clip-text text-transparent">
                Empty Space
              </span>
            </div>
            <p className="text-foreground/70 mb-4 leading-relaxed">
              Transforming ideas into reality with cutting-edge technologies and innovative solutions.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Linkedin, href: '#' },
                { icon: Github, href: '#' },
                { icon: Twitter, href: '#' }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 bg-gradient-to-br from-[#3e4463] to-[#c43b8c] rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300"
                >
                  <social.icon className="w-5 h-5 text-white" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-foreground/70 hover:text-foreground transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-bold mb-4">Contact</h3>
            <div className="space-y-2 text-foreground/70">
              <p>contact@emptyspace.com</p>
              <p>+1 (123) 456-7890</p>
              <p>San Francisco, CA</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-foreground/70 text-sm mb-4 md:mb-0"
          >
            © 2025 Empty Space. All rights reserved. | Powered by Empty Space Technologies
          </motion.p>

          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-gradient-to-br from-[#3e4463] to-[#c43b8c] rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300"
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </footer>
  )
}