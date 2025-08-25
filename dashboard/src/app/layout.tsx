import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/hooks/useTheme'
import { LanguageProvider } from '@/hooks/useLanguage'
import { AuthProvider } from '@/providers/auth-provider'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HR Dashboard - Employee Management System',
  description: 'A comprehensive HR dashboard for managing employees, projects, tasks, and more.',
  keywords: ['HR', 'dashboard', 'employee management', 'project management', 'task management'],
  authors: [{ name: 'HR Dashboard Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <LanguageProvider defaultLanguage="en" storageKey="empty-space-hr-language">
            <ThemeProvider defaultTheme="light" storageKey="empty-space-hr-theme">
              <AuthProvider>
                {children}
                <Toaster position="top-right" />
              </AuthProvider>
            </ThemeProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
