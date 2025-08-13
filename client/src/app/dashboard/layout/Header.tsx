'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Bell, Settings, User, LogOut, Menu, Languages } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface HeaderProps {
  userRole: string
}

export function Header({ userRole }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('')
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t, direction } = useLanguage()
  const [notifications] = useState(5) // Mock notification count

  const getUserInitials = (role: string) => {
    const roleMap: Record<string, string> = {
      'Admin': 'JA',
      'HR': 'SH',
      'Manager': 'MP',
      'Employee': 'DE'
    }
    return roleMap[role] || 'U'
  }

  const getUserName = (role: string) => {
    const nameMap: Record<string, string> = {
      'Admin': 'John Admin',
      'HR': 'Sarah HR',
      'Manager': 'Mike Project',
      'Employee': 'David Employee'
    }
    return nameMap[role] || 'User'
  }

  const getUserEmail = (role: string) => {
    const emailMap: Record<string, string> = {
      'Admin': 'john.admin@emptyspace.com',
      'HR': 'sarah.hr@emptyspace.com',
      'Manager': 'mike.project@emptyspace.com',
      'Employee': 'david.employee@emptyspace.com'
    }
    return emailMap[role] || 'user@emptyspace.com'
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en')
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between shadow-sm">
      {/* Left Section - Search */}
      <div className={`flex items-center gap-4 flex-1 max-w-2xl ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden h-8 w-8 p-0"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 ${direction === 'rtl' ? 'right-3' : 'left-3'}`} />
          <Input
            placeholder={t('header.search.placeholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`h-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-950 transition-colors ${direction === 'rtl' ? 'pr-10 text-right' : 'pl-10'}`}
            dir={direction}
          />
        </div>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="h-9 w-9 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title={t('language.switchTo', { language: language === 'en' ? t('language.arabic') : t('language.english') })}
        >
          <Languages className="h-4 w-4" />
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title={t('header.notifications')}
        >
          <Bell className="h-4 w-4" />
          {notifications > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-600 border-2 border-white dark:border-gray-950">
              {notifications > 9 ? '9+' : notifications}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8 ring-2 ring-gray-200 dark:ring-gray-800">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-medium">
                    {getUserInitials(userRole)}
                  </AvatarFallback>
                </Avatar>
                <div className={`hidden md:block ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {getUserName(userRole)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t(`role.${userRole.toLowerCase()}`)}
                  </div>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'} className="w-64 p-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-lg">
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-10 w-10 ring-2 ring-gray-200 dark:ring-gray-800">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium">
                    {getUserInitials(userRole)}
                  </AvatarFallback>
                </Avatar>
                <div className={direction === 'rtl' ? 'text-right' : ''}>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {getUserName(userRole)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {getUserEmail(userRole)}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="mt-1 text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:text-purple-300 dark:border-purple-800"
                  >
                    {t(`role.${userRole.toLowerCase()}`)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="py-2">
              <DropdownMenuItem className={`flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <User className="h-4 w-4" />
                <div className={direction === 'rtl' ? 'text-right' : ''}>
                  <div className="font-medium">{t('header.profile')}</div>
                  <div className="text-xs text-gray-500">{t('header.profile.description')}</div>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem className={`flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <Settings className="h-4 w-4" />
                <div className={direction === 'rtl' ? 'text-right' : ''}>
                  <div className="font-medium">{t('header.settings')}</div>
                  <div className="text-xs text-gray-500">{t('header.settings.description')}</div>
                </div>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
            
            <DropdownMenuItem className={`flex items-center gap-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <LogOut className="h-4 w-4" />
              <div className={direction === 'rtl' ? 'text-right' : ''}>
                <div className="font-medium">{t('header.signOut')}</div>
                <div className="text-xs text-red-500">{t('header.signOut.description')}</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}