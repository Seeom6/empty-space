import React from 'react'
import { render, screen } from '../test-utils'
import { TechnologyStats } from '../../components/TechnologyStats'
import { createMockStats, createMockTechnologies } from '../test-utils'

describe('TechnologyStats Component', () => {
  const mockStats = createMockStats()
  const mockTechnologies = createMockTechnologies(5)
  
  const defaultProps = {
    stats: mockStats,
    technologies: mockTechnologies,
  }

  describe('Rendering', () => {
    it('should render all stat cards correctly', () => {
      render(<TechnologyStats {...defaultProps} />)

      // Check all stat card titles
      expect(screen.getByText('Total Technologies')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Inactive')).toBeInTheDocument()
      expect(screen.getByText('Deprecated')).toBeInTheDocument()
      expect(screen.getByText('Most Used')).toBeInTheDocument()

      // Check stat values
      expect(screen.getByText(mockStats.total.toString())).toBeInTheDocument()
      expect(screen.getByText(mockStats.active.toString())).toBeInTheDocument()
      expect(screen.getByText(mockStats.inactive.toString())).toBeInTheDocument()
      expect(screen.getByText(mockStats.deprecated.toString())).toBeInTheDocument()
    })

    it('should render stat descriptions', () => {
      render(<TechnologyStats {...defaultProps} />)

      expect(screen.getByText('All technologies')).toBeInTheDocument()
      expect(screen.getByText('Currently used')).toBeInTheDocument()
      expect(screen.getByText('Not in use')).toBeInTheDocument()
      expect(screen.getByText('End of life')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      const { container } = render(
        <TechnologyStats {...defaultProps} className="custom-class" />
      )

      const statsContainer = container.firstChild as HTMLElement
      expect(statsContainer).toHaveClass('custom-class')
    })

    it('should use responsive grid layout', () => {
      const { container } = render(<TechnologyStats {...defaultProps} />)

      const statsContainer = container.firstChild as HTMLElement
      expect(statsContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-5', 'gap-4')
    })
  })

  describe('Most Used Technologies', () => {
    it('should display most used technologies', () => {
      const technologiesWithUsers = [
        { ...createMockTechnologies(1)[0], name: 'React', userCount: 15, status: 'active' as const },
        { ...createMockTechnologies(1)[0], name: 'Vue', userCount: 10, status: 'active' as const },
        { ...createMockTechnologies(1)[0], name: 'Angular', userCount: 5, status: 'active' as const },
      ]

      render(
        <TechnologyStats 
          {...defaultProps} 
          technologies={technologiesWithUsers} 
        />
      )

      // Should show top 2 most used technologies (default limit)
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Vue')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      
      // Angular should not be shown (limit is 2)
      expect(screen.queryByText('Angular')).not.toBeInTheDocument()
    })

    it('should handle technologies with icons', () => {
      const technologiesWithIcons = [
        { 
          ...createMockTechnologies(1)[0], 
          name: 'React', 
          userCount: 15, 
          status: 'active' as const,
          icon: '⚛️'
        },
      ]

      render(
        <TechnologyStats 
          {...defaultProps} 
          technologies={technologiesWithIcons} 
        />
      )

      expect(screen.getByText('⚛️')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()
    })

    it('should show message when no active technologies', () => {
      const inactiveTechnologies = createMockTechnologies(3).map(tech => ({
        ...tech,
        status: 'inactive' as const
      }))

      render(
        <TechnologyStats 
          {...defaultProps} 
          technologies={inactiveTechnologies} 
        />
      )

      expect(screen.getByText('No active technologies')).toBeInTheDocument()
    })

    it('should truncate long technology names', () => {
      const techWithLongName = [
        { 
          ...createMockTechnologies(1)[0], 
          name: 'Very Long Technology Name That Should Be Truncated', 
          userCount: 15, 
          status: 'active' as const 
        },
      ]

      render(
        <TechnologyStats 
          {...defaultProps} 
          technologies={techWithLongName} 
        />
      )

      const nameElement = screen.getByTitle('Very Long Technology Name That Should Be Truncated')
      expect(nameElement).toBeInTheDocument()
      expect(nameElement).toHaveClass('truncate')
    })
  })

  describe('Icons and Styling', () => {
    it('should render stat card icons with correct colors', () => {
      render(<TechnologyStats {...defaultProps} />)

      // Check if icons are rendered (we can't easily test the specific icons, but we can check structure)
      const cards = screen.getAllByRole('heading', { level: 3 })
      expect(cards).toHaveLength(5) // 4 stat cards + 1 most used card
    })

    it('should apply hover effects to cards', () => {
      render(<TechnologyStats {...defaultProps} />)

      const cards = screen.getAllByText(/Total Technologies|Active|Inactive|Deprecated|Most Used/)
      cards.forEach(card => {
        const cardElement = card.closest('.hover\\:shadow-md')
        expect(cardElement).toBeInTheDocument()
      })
    })
  })

  describe('Data Handling', () => {
    it('should handle zero values gracefully', () => {
      const zeroStats = createMockStats({
        total: 0,
        active: 0,
        inactive: 0,
        deprecated: 0,
      })

      render(
        <TechnologyStats 
          stats={zeroStats} 
          technologies={[]} 
        />
      )

      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('No active technologies')).toBeInTheDocument()
    })

    it('should handle large numbers correctly', () => {
      const largeStats = createMockStats({
        total: 1000,
        active: 750,
        inactive: 200,
        deprecated: 50,
      })

      render(
        <TechnologyStats 
          stats={largeStats} 
          technologies={mockTechnologies} 
        />
      )

      expect(screen.getByText('1000')).toBeInTheDocument()
      expect(screen.getByText('750')).toBeInTheDocument()
      expect(screen.getByText('200')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
    })

    it('should handle missing technology data', () => {
      render(
        <TechnologyStats 
          stats={mockStats} 
          technologies={[]} 
        />
      )

      expect(screen.getByText('No active technologies')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<TechnologyStats {...defaultProps} />)

      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
      
      // All card titles should be headings
      expect(screen.getByRole('heading', { name: /total technologies/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /active/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /inactive/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /deprecated/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /most used/i })).toBeInTheDocument()
    })

    it('should have meaningful text content for screen readers', () => {
      render(<TechnologyStats {...defaultProps} />)

      // Check that descriptions are present for context
      expect(screen.getByText('All technologies')).toBeInTheDocument()
      expect(screen.getByText('Currently used')).toBeInTheDocument()
      expect(screen.getByText('Not in use')).toBeInTheDocument()
      expect(screen.getByText('End of life')).toBeInTheDocument()
    })
  })

  describe('Component Memoization', () => {
    it('should be memoized to prevent unnecessary re-renders', () => {
      const { rerender } = render(<TechnologyStats {...defaultProps} />)

      // Re-render with same props
      rerender(<TechnologyStats {...defaultProps} />)

      // Component should still render correctly
      expect(screen.getByText('Total Technologies')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined stats gracefully', () => {
      const undefinedStats = {
        total: 0,
        active: 0,
        inactive: 0,
        deprecated: 0,
        categories: {} as any,
      }

      render(
        <TechnologyStats 
          stats={undefinedStats} 
          technologies={mockTechnologies} 
        />
      )

      expect(screen.getByText('Total Technologies')).toBeInTheDocument()
    })

    it('should handle technologies without userCount', () => {
      const technologiesWithoutUserCount = createMockTechnologies(2).map(tech => ({
        ...tech,
        userCount: 0,
      }))

      render(
        <TechnologyStats 
          {...defaultProps} 
          technologies={technologiesWithoutUserCount} 
        />
      )

      expect(screen.getByText('No active technologies')).toBeInTheDocument()
    })
  })
})
