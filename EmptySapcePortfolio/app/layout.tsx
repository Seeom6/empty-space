import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Empty Space - Transforming Ideas Into Reality',
  description: 'A modern, elegant portfolio website for Empty Space software development company featuring a clean, minimalistic design with space-themed aesthetics.',
  keywords: ['portfolio', 'software development', 'web development', 'mobile apps', 'UI/UX design'],
  authors: [{ name: 'Empty Space' }],
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
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
