import React from 'react'

interface TechIconProps {
  name: string
  className?: string
}

export function TechIcon({ name, className = "w-8 h-8" }: TechIconProps) {
  const icons: Record<string, JSX.Element> = {
    'React': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="3" fill="#61DAFB"/>
        <path d="M12 1C15.5 1 21 4 21 12C21 20 15.5 23 12 23C8.5 23 3 20 3 12C3 4 8.5 1 12 1Z" stroke="#61DAFB" strokeWidth="2" fill="none"/>
        <path d="M12 1C8.5 1 3 4 3 12C3 20 8.5 23 12 23" stroke="#61DAFB" strokeWidth="2" fill="none"/>
        <path d="M12 23C15.5 23 21 20 21 12C21 4 15.5 1 12 1" stroke="#61DAFB" strokeWidth="2" fill="none"/>
      </svg>
    ),
    'Next.js': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="10" fill="#000000"/>
        <path d="M18 12L8 6V18L18 12Z" fill="#FFFFFF"/>
        <path d="M16 8L16 16" stroke="#FFFFFF" strokeWidth="2"/>
      </svg>
    ),
    'Nest.js': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#E0234E"/>
        <path d="M12 8L16 12L12 16L8 12L12 8Z" fill="#FFFFFF"/>
        <circle cx="12" cy="12" r="2" fill="#E0234E"/>
      </svg>
    ),
    'TypeScript': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="2" fill="#3178C6"/>
        <path d="M8 8H16M12 8V16M10 16H14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    'TailwindCSS': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 6C8 6 6 8 6 12C8 10 10 10 12 12C14 14 16 14 18 12C18 8 16 6 12 6Z" fill="#06B6D4"/>
        <path d="M6 12C4 12 3 13 3 15C4 14 5 14 6 15C7 16 8 16 9 15C9 13 8 12 6 12Z" fill="#06B6D4"/>
      </svg>
    ),
    'MongoDB': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 2C8 2 5 5 5 9C5 15 12 22 12 22S19 15 19 9C19 5 16 2 12 2Z" fill="#4DB33D"/>
        <path d="M12 7C10.5 7 9 8.5 9 10C9 12.5 12 16 12 16S15 12.5 15 10C15 8.5 13.5 7 12 7Z" fill="#FFFFFF"/>
      </svg>
    ),
    'Redis': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="2" y="6" width="20" height="12" rx="2" fill="#DC382D"/>
        <rect x="4" y="8" width="16" height="2" fill="#FFFFFF"/>
        <rect x="4" y="11" width="16" height="2" fill="#FFFFFF"/>
        <rect x="4" y="14" width="16" height="2" fill="#FFFFFF"/>
      </svg>
    ),
    'Node.js': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 2L22 8V16L12 22L2 16V8L12 2Z" fill="#339933"/>
        <path d="M12 2V22M2 8L22 16M22 8L2 16" stroke="#FFFFFF" strokeWidth="1"/>
      </svg>
    ),
    'Docker': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="2" y="8" width="20" height="8" rx="1" fill="#2496ED"/>
        <rect x="4" y="10" width="3" height="4" fill="#FFFFFF"/>
        <rect x="8" y="10" width="3" height="4" fill="#FFFFFF"/>
        <rect x="12" y="10" width="3" height="4" fill="#FFFFFF"/>
        <rect x="16" y="10" width="3" height="4" fill="#FFFFFF"/>
        <rect x="8" y="6" width="3" height="3" fill="#2496ED"/>
        <rect x="12" y="6" width="3" height="3" fill="#2496ED"/>
      </svg>
    ),
    'AWS': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M3 12L12 3L21 12L12 21L3 12Z" fill="#FF9900"/>
        <path d="M7 12L12 7L17 12L12 17L7 12Z" fill="#FFFFFF"/>
        <rect x="10" y="10" width="4" height="4" fill="#FF9900"/>
      </svg>
    ),
    'GraphQL': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill="#E10098"/>
        <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
        <circle cx="6" cy="8" r="1.5" fill="#FFFFFF"/>
        <circle cx="18" cy="8" r="1.5" fill="#FFFFFF"/>
        <circle cx="18" cy="16" r="1.5" fill="#FFFFFF"/>
        <circle cx="6" cy="16" r="1.5" fill="#FFFFFF"/>
      </svg>
    ),
    'PostgreSQL': (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="10" fill="#336791"/>
        <path d="M8 8C8 6 10 4 12 4C14 4 16 6 16 8V16C16 18 14 20 12 20C10 20 8 18 8 16V8Z" fill="#FFFFFF"/>
        <path d="M10 10H14M10 12H14M10 14H14" stroke="#336791" strokeWidth="1"/>
      </svg>
    )
  }

  return icons[name] || (
    <div className={`${className} bg-gradient-to-br from-gray-400 to-gray-600 rounded flex items-center justify-center text-white text-xs font-bold`}>
      {name.slice(0, 2)}
    </div>
  )
}