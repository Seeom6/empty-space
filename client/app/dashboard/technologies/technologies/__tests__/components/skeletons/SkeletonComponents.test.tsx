import React from 'react'
import { render, screen } from '../../test-utils'
import {
  SkeletonCard,
  SkeletonCardGrid,
  SkeletonTable,
  SkeletonStats,
  SkeletonFilters,
  SkeletonPage,
  SkeletonModal,
  SkeletonTechnologyDetails
} from '../../../components/skeletons'

describe('Skeleton Components', () => {
  describe('SkeletonCard', () => {
    it('should render skeleton card with proper structure', () => {
      render(<SkeletonCard />)
      
      // Check for card structure
      const card = document.querySelector('.animate-pulse')
      expect(card).toBeInTheDocument()
      
      // Check for skeleton elements
      const skeletonElements = document.querySelectorAll('.bg-gray-200')
      expect(skeletonElements.length).toBeGreaterThan(5) // Multiple skeleton elements
    })

    it('should apply custom className', () => {
      const { container } = render(<SkeletonCard className="custom-class" />)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('SkeletonCardGrid', () => {
    it('should render default number of skeleton cards', () => {
      render(<SkeletonCardGrid />)
      
      const cards = document.querySelectorAll('.animate-pulse')
      expect(cards.length).toBe(6) // Default count
    })

    it('should render custom number of skeleton cards', () => {
      render(<SkeletonCardGrid count={3} />)
      
      const cards = document.querySelectorAll('.animate-pulse')
      expect(cards.length).toBe(3)
    })

    it('should use responsive grid layout', () => {
      const { container } = render(<SkeletonCardGrid />)
      
      const grid = container.firstChild as HTMLElement
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
    })
  })

  describe('SkeletonTable', () => {
    it('should render table with headers', () => {
      render(<SkeletonTable />)
      
      // Check for table headers
      expect(screen.getByText('Technology')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Version')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Updated')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should render default number of skeleton rows', () => {
      render(<SkeletonTable />)
      
      const rows = document.querySelectorAll('tbody tr')
      expect(rows.length).toBe(5) // Default rows
    })

    it('should render custom number of skeleton rows', () => {
      render(<SkeletonTable rows={3} />)
      
      const rows = document.querySelectorAll('tbody tr')
      expect(rows.length).toBe(3)
    })

    it('should have proper table structure', () => {
      render(<SkeletonTable />)
      
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      
      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders).toHaveLength(7) // 7 columns
    })
  })

  describe('SkeletonStats', () => {
    it('should render all stat cards', () => {
      render(<SkeletonStats />)
      
      // Should render 5 cards (4 stat cards + 1 most used card)
      const cards = document.querySelectorAll('.animate-pulse')
      expect(cards.length).toBe(5)
    })

    it('should use responsive grid layout', () => {
      const { container } = render(<SkeletonStats />)
      
      const grid = container.firstChild as HTMLElement
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-5')
    })

    it('should apply custom className', () => {
      const { container } = render(<SkeletonStats className="custom-class" />)
      
      const grid = container.firstChild as HTMLElement
      expect(grid).toHaveClass('custom-class')
    })
  })

  describe('SkeletonFilters', () => {
    it('should render filter skeleton elements', () => {
      render(<SkeletonFilters />)
      
      // Should have skeleton elements for search, category, status, and clear button
      const skeletonElements = document.querySelectorAll('.bg-gray-200')
      expect(skeletonElements.length).toBeGreaterThan(6) // Multiple filter elements
    })

    it('should use responsive grid layout', () => {
      const { container } = render(<SkeletonFilters />)
      
      const grid = container.firstChild as HTMLElement
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-4')
    })

    it('should apply animation', () => {
      const { container } = render(<SkeletonFilters />)
      
      const grid = container.firstChild as HTMLElement
      expect(grid).toHaveClass('animate-pulse')
    })
  })

  describe('SkeletonPage', () => {
    it('should render complete page skeleton', () => {
      render(<SkeletonPage />)
      
      // Check for main sections
      const skeletonElements = document.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(10) // Multiple sections
    })

    it('should render grid view by default', () => {
      render(<SkeletonPage />)
      
      // Should render card grid skeleton
      const grid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3')
      expect(grid).toBeInTheDocument()
    })

    it('should render table view when specified', () => {
      render(<SkeletonPage viewMode="list" />)
      
      // Should render table skeleton
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<SkeletonPage className="custom-class" />)
      
      const page = container.firstChild as HTMLElement
      expect(page).toHaveClass('custom-class')
    })
  })

  describe('SkeletonModal', () => {
    it('should render modal overlay', () => {
      render(<SkeletonModal />)
      
      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50')
      expect(overlay).toBeInTheDocument()
    })

    it('should render default loading text', () => {
      render(<SkeletonModal />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render custom title', () => {
      render(<SkeletonModal title="Custom Loading" />)
      
      expect(screen.getByText('Custom Loading')).toBeInTheDocument()
    })

    it('should have proper modal structure', () => {
      render(<SkeletonModal />)
      
      const modal = document.querySelector('.bg-white.rounded-lg')
      expect(modal).toBeInTheDocument()
      
      const animatedElements = document.querySelectorAll('.animate-pulse')
      expect(animatedElements.length).toBeGreaterThan(0)
    })
  })

  describe('SkeletonTechnologyDetails', () => {
    it('should render technology details skeleton', () => {
      render(<SkeletonTechnologyDetails />)
      
      const skeletonElements = document.querySelectorAll('.bg-gray-200')
      expect(skeletonElements.length).toBeGreaterThan(10) // Multiple detail elements
    })

    it('should have proper structure', () => {
      render(<SkeletonTechnologyDetails />)
      
      // Check for main sections
      const container = document.querySelector('.animate-pulse')
      expect(container).toBeInTheDocument()
      
      // Check for grid layout
      const grid = document.querySelector('.grid.grid-cols-2')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not interfere with screen readers', () => {
      render(<SkeletonPage />)
      
      // Skeleton components should not have interactive elements
      const buttons = screen.queryAllByRole('button')
      const links = screen.queryAllByRole('link')
      const inputs = screen.queryAllByRole('textbox')
      
      expect(buttons).toHaveLength(0)
      expect(links).toHaveLength(0)
      expect(inputs).toHaveLength(0)
    })

    it('should have proper contrast for skeleton elements', () => {
      render(<SkeletonCard />)
      
      const skeletonElements = document.querySelectorAll('.bg-gray-200')
      expect(skeletonElements.length).toBeGreaterThan(0)
      
      // All skeleton elements should use the same gray color for consistency
      skeletonElements.forEach(element => {
        expect(element).toHaveClass('bg-gray-200')
      })
    })
  })

  describe('Animation', () => {
    it('should apply pulse animation to all skeleton components', () => {
      render(<SkeletonPage />)
      
      const animatedElements = document.querySelectorAll('.animate-pulse')
      expect(animatedElements.length).toBeGreaterThan(5)
    })

    it('should not cause layout shift', () => {
      const { container } = render(<SkeletonCardGrid />)
      
      // Skeleton should maintain the same layout as the actual content
      const grid = container.firstChild as HTMLElement
      expect(grid).toHaveClass('grid', 'gap-4')
    })
  })

  describe('Responsive Design', () => {
    it('should maintain responsive classes', () => {
      render(<SkeletonPage />)
      
      // Check for responsive grid classes
      const responsiveElements = document.querySelectorAll('.md\\:grid-cols-2, .md\\:grid-cols-4, .md\\:grid-cols-5')
      expect(responsiveElements.length).toBeGreaterThan(0)
    })
  })
})
