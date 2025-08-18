import React from 'react'

export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const savedTheme = localStorage.getItem('darkMode');
        const isDark = savedTheme !== null ? JSON.parse(savedTheme) : true;

        // Prevent flash of wrong theme
        const root = document.documentElement;

        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }

        // Set a flag to indicate the script has run
        window.__themeInitialized = true;
      } catch (e) {
        // Fallback to dark mode if there's an error
        document.documentElement.classList.add('dark');
      }
    })();
  `

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: themeScript,
      }}
    />
  )
}