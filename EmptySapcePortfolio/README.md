# Empty Space Portfolio

A modern, elegant portfolio website for Empty Space software development company featuring a clean, minimalistic design with space-themed aesthetics, dark/light mode support, and comprehensive Arabic/English language support.

![Empty Space Portfolio](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.16-0055FF?style=for-the-badge&logo=framer)

## ✨ Features

- 🌙 **Dark/Light Mode**: Smooth theme switching with persistent preferences
- 🌍 **Bilingual Support**: Complete Arabic/English language support with RTL layout
- 📱 **Responsive Design**: Mobile-first approach with seamless cross-device experience
- 🎨 **Modern UI**: Clean, minimalistic design with space-themed aesthetics
- ⚡ **Smooth Animations**: Powered by Framer Motion for engaging user interactions
- 🚀 **Performance Optimized**: Built with Next.js 14 and optimized for speed
- 🎯 **Interactive Elements**: Animated circuit board backgrounds, floating particles
- 📧 **Contact Form**: Functional contact form with validation
- 🛠 **Component-Based**: Modular architecture for easy maintenance

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm 8.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/empty-space-portfolio.git
   cd empty-space-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
empty-space-portfolio/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   └── utils.ts
│   ├── figma/            # Image utilities
│   │   └── ImageWithFallback.tsx
│   ├── About.tsx         # About section
│   ├── Contact.tsx       # Contact form
│   ├── Footer.tsx        # Site footer
│   ├── Header.tsx        # Navigation header
│   ├── Hero.tsx          # Landing section
│   ├── LanguageContext.tsx # Language management
│   ├── ProjectModal.tsx  # Project details modal
│   ├── Projects.tsx      # Portfolio showcase
│   ├── Services.tsx      # Services section
│   ├── TechIcon.tsx      # Technology icons
│   ├── Technologies.tsx  # Tech stack display
│   ├── ThemeScript.tsx   # Theme initialization
│   └── projectsData.ts   # Project data
├── styles/
│   └── globals.css       # Global styles and CSS variables
├── types/
│   └── global.d.ts       # TypeScript declarations
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Design System

### Color Palette

#### Brand Colors
- **Primary Dark**: `#3e4463` - Main brand color (dark blue-gray)
- **Primary Light**: `#c43b8c` - Accent color (magenta)

#### Theme Colors
- **Light Mode**: Clean whites and subtle grays
- **Dark Mode**: Deep blacks with purple accents

### Typography
- **Base Font Size**: 14px
- **Font Weight**: Medium for headings, Normal for body
- **Line Height**: 1.5

## 🌟 Key Components

### Header
- Fixed navigation with scroll-based backdrop blur
- Logo with rotation animation
- Language toggle (EN/AR with RTL support)
- Theme toggle (Light/Dark mode)
- Mobile-responsive hamburger menu

### Hero Section
- Animated electronic circuit board background
- Floating particles and cosmic elements
- Responsive gradient text headings
- Call-to-action buttons with hover animations
- Statistics grid with interactive effects

### Projects Showcase
- Featured project carousel with navigation
- Browser mockup design for project previews
- Technology badges with icons
- Modal integration for detailed views

### Contact Form
- Cosmic/space themed background with animated stars
- Spaceship-inspired form design
- Form validation and submission handling
- Floating planet animations

## 🌍 Internationalization

The project supports both English and Arabic languages with:
- Complete UI translation
- RTL (Right-to-Left) layout support for Arabic
- Language toggle in header
- Persistent language preference

## 🎭 Theme System

Advanced theme management with:
- Instant theme switching
- Smooth color transitions
- Persistent theme preferences
- No flash of wrong theme on load
- CSS custom properties for consistent theming

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Manual Deployment
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide React](https://lucide.dev/) - Icon library
- [Radix UI](https://www.radix-ui.com/) - Headless UI components

---

**Empty Space** - Transforming Ideas Into Reality 🚀
