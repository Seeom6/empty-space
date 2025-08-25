'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Users,
  FolderOpen,
  CheckSquare,
  Shield,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Code,
  Mail,
} from 'lucide-react'

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
  badge?: string
}

// Main navigation items
const mainNavItems: SidebarItem[] = [
  {
    title: 'Employees',
    href: '/dashboard/employees',
    icon: Users,
    badge: '156',
    roles: ['admin', 'hr', 'manager'],
  },
  {
    title: 'Projects',
    href: '/dashboard/projects',
    icon: FolderOpen,
    badge: '24',
  },
  {
    title: 'Tasks',
    href: '/dashboard/tasks',
    icon: CheckSquare,
    badge: '89',
  },
  {
    title: 'Teams',
    href: '/dashboard/teams',
    icon: Building2,
    roles: ['admin', 'hr', 'manager'],
  },
  {
    title: 'Attendance',
    href: '/dashboard/attendance',
    icon: Clock,
  },
  {
    title: 'Payroll',
    href: '/dashboard/payroll',
    icon: DollarSign,
    roles: ['admin', 'hr'],
  },
  {
    title: 'Performance',
    href: '/dashboard/performance',
    icon: TrendingUp,
    roles: ['admin', 'hr', 'manager'],
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: ['admin', 'hr', 'manager'],
  },
]

// System section items
const systemNavItems: SidebarItem[] = [
  {
    title: 'Invitations',
    href: '/dashboard/invitations',
    icon: Mail,
    roles: ['admin', 'hr'],
  },
  {
    title: 'Technologies',
    href: '/dashboard/technologies',
    icon: Code,
    roles: ['admin', 'hr'],
  },
  {
    title: 'Permissions',
    href: '/dashboard/rbac',
    icon: Shield,
    roles: ['admin'],
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  // Mock user role - in real app, this would come from auth context
  const userRole = 'admin'

  const filteredMainItems = mainNavItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole.toLowerCase())
  })

  const filteredSystemItems = systemNavItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole.toLowerCase())
  })

  return (
    <div
      className={cn(
        'relative flex flex-col bg-slate-900 border-r border-slate-700/50 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
              HR
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Empty Space</h2>
              <p className="text-sm text-slate-400">HR Management</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center w-full">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
              HR
            </div>
          </div>
        )}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="ml-auto h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Current Role */}
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <div className="text-xs text-slate-500 mb-2">Current Role</div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
            <span className="text-sm font-medium text-purple-300">Admin</span>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {filteredMainItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'group flex items-center px-3 py-4 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50',
                    isCollapsed ? 'justify-center' : 'justify-start'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      !isCollapsed && 'mr-3'
                    )}
                  />

                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.title}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* System Section */}
        <div className="mt-8">
          {!isCollapsed && (
            <div className="px-3 mb-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                SYSTEM
              </h3>
            </div>
          )}

          <div className="space-y-1">
            {filteredSystemItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50',
                      isCollapsed ? 'justify-center' : 'justify-start'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        !isCollapsed && 'mr-3'
                      )}
                    />

                    {!isCollapsed && (
                      <div className="flex-1">
                        <div className="truncate">{item.title}</div>
                        {(item.title === 'Invitations' || item.title === 'Technologies' || item.title === 'Permissions') && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {item.title === 'Invitations' && 'Manage employee invite codes'}
                            {item.title === 'Technologies' && 'Company tech stack'}
                            {item.title === 'Permissions' && 'Role-based access control'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.title}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">Empty Space HR v2.0</div>
              <div className="text-xs text-slate-400">© 2024 All rights reserved</div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full h-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
