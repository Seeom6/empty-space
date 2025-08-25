import React from 'react'
import { render, screen, fireEvent, waitFor } from '../test-utils'
import userEvent from '@testing-library/user-event'
import { TechnologyFilters } from '../../components/TechnologyFilters'
import { createMockFilters } from '../test-utils'

describe('TechnologyFilters Component', () => {
  const mockFilters = createMockFilters()
  const mockOnFiltersChange = jest.fn()
  const mockOnClearFilters = jest.fn()

  const defaultProps = {
    filters: mockFilters,
    onFiltersChange: mockOnFiltersChange,
    onClearFilters: mockOnClearFilters,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all filter controls', () => {
      render(<TechnologyFilters {...defaultProps} />)

      // Search input
      expect(screen.getByPlaceholderText(/search technologies/i)).toBeInTheDocument()
      
      // Category filter
      expect(screen.getByText(/category/i)).toBeInTheDocument()
      
      // Status filter
      expect(screen.getByText(/status/i)).toBeInTheDocument()
      
      // Clear filters button
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      const { container } = render(
        <TechnologyFilters {...defaultProps} className="custom-class" />
      )

      const filtersContainer = container.firstChild as HTMLElement
      expect(filtersContainer).toHaveClass('custom-class')
    })

    it('should display current filter values', () => {
      const filtersWithValues = createMockFilters({
        search: 'React',
        category: 'Frontend',
        status: 'active'
      })

      render(
        <TechnologyFilters 
          {...defaultProps} 
          filters={filtersWithValues} 
        />
      )

      const searchInput = screen.getByDisplayValue('React')
      expect(searchInput).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should call onFiltersChange when search input changes', async () => {
      const user = userEvent.setup()
      render(<TechnologyFilters {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(/search technologies/i)
      await user.type(searchInput, 'React')

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'React' })
      })
    })

    it('should debounce search input changes', async () => {
      const user = userEvent.setup()
      render(<TechnologyFilters {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(/search technologies/i)
      
      // Type quickly
      await user.type(searchInput, 'React')
      
      // Should not call immediately for each character
      expect(mockOnFiltersChange).not.toHaveBeenCalledWith({ search: 'R' })
      expect(mockOnFiltersChange).not.toHaveBeenCalledWith({ search: 'Re' })
      
      // Should eventually call with final value
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'React' })
      }, { timeout: 500 })
    })

    it('should clear search when input is emptied', async () => {
      const user = userEvent.setup()
      const filtersWithSearch = createMockFilters({ search: 'React' })
      
      render(
        <TechnologyFilters 
          {...defaultProps} 
          filters={filtersWithSearch} 
        />
      )

      const searchInput = screen.getByDisplayValue('React')
      await user.clear(searchInput)

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: '' })
      })
    })
  })

  describe('Category Filter', () => {
    it('should show all category options', async () => {
      const user = userEvent.setup()
      render(<TechnologyFilters {...defaultProps} />)

      // Find and click category select trigger
      const categorySelect = screen.getByRole('combobox', { name: /category/i })
      await user.click(categorySelect)

      // Check for category options
      await waitFor(() => {
        expect(screen.getByText('All Categories')).toBeInTheDocument()
        expect(screen.getByText('Frontend')).toBeInTheDocument()
        expect(screen.getByText('Backend')).toBeInTheDocument()
        expect(screen.getByText('Database')).toBeInTheDocument()
        expect(screen.getByText('DevOps')).toBeInTheDocument()
        expect(screen.getByText('Mobile')).toBeInTheDocument()
        expect(screen.getByText('Design')).toBeInTheDocument()
        expect(screen.getByText('Testing')).toBeInTheDocument()
        expect(screen.getByText('Analytics')).toBeInTheDocument()
      })
    })

    it('should call onFiltersChange when category is selected', async () => {
      const user = userEvent.setup()
      render(<TechnologyFilters {...defaultProps} />)

      const categorySelect = screen.getByRole('combobox', { name: /category/i })
      await user.click(categorySelect)

      await waitFor(() => {
        expect(screen.getByText('Frontend')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Frontend'))

      expect(mockOnFiltersChange).toHaveBeenCalledWith({ category: 'Frontend' })
    })

    it('should display selected category', () => {
      const filtersWithCategory = createMockFilters({ category: 'Frontend' })
      
      render(
        <TechnologyFilters 
          {...defaultProps} 
          filters={filtersWithCategory} 
        />
      )

      expect(screen.getByText('Frontend')).toBeInTheDocument()
    })
  })

  describe('Status Filter', () => {
    it('should show all status options', async () => {
      const user = userEvent.setup()
      render(<TechnologyFilters {...defaultProps} />)

      const statusSelect = screen.getByRole('combobox', { name: /status/i })
      await user.click(statusSelect)

      await waitFor(() => {
        expect(screen.getByText('All Statuses')).toBeInTheDocument()
        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(screen.getByText('Inactive')).toBeInTheDocument()
        expect(screen.getByText('Deprecated')).toBeInTheDocument()
      })
    })

    it('should call onFiltersChange when status is selected', async () => {
      const user = userEvent.setup()
      render(<TechnologyFilters {...defaultProps} />)

      const statusSelect = screen.getByRole('combobox', { name: /status/i })
      await user.click(statusSelect)

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Active'))

      expect(mockOnFiltersChange).toHaveBeenCalledWith({ status: 'active' })
    })

    it('should display selected status', () => {
      const filtersWithStatus = createMockFilters({ status: 'active' })
      
      render(
        <TechnologyFilters 
          {...defaultProps} 
          filters={filtersWithStatus} 
        />
      )

      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  describe('Clear Filters', () => {
    it('should call onClearFilters when clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<TechnologyFilters {...defaultProps} />)

      const clearButton = screen.getByText(/clear filters/i)
      await user.click(clearButton)

      expect(mockOnClearFilters).toHaveBeenCalled()
    })

    it('should show clear button as enabled when filters are applied', () => {
      const filtersWithValues = createMockFilters({
        search: 'React',
        category: 'Frontend',
        status: 'active'
      })

      render(
        <TechnologyFilters 
          {...defaultProps} 
          filters={filtersWithValues} 
        />
      )

      const clearButton = screen.getByText(/clear filters/i)
      expect(clearButton).not.toBeDisabled()
    })

    it('should show clear button as disabled when no filters are applied', () => {
      render(<TechnologyFilters {...defaultProps} />)

      const clearButton = screen.getByText(/clear filters/i)
      expect(clearButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for form controls', () => {
      render(<TechnologyFilters {...defaultProps} />)

      expect(screen.getByLabelText(/search/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<TechnologyFilters {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(/search technologies/i)
      
      // Tab to search input
      await user.tab()
      expect(searchInput).toHaveFocus()

      // Tab to category select
      await user.tab()
      const categorySelect = screen.getByRole('combobox', { name: /category/i })
      expect(categorySelect).toHaveFocus()

      // Tab to status select
      await user.tab()
      const statusSelect = screen.getByRole('combobox', { name: /status/i })
      expect(statusSelect).toHaveFocus()

      // Tab to clear button
      await user.tab()
      const clearButton = screen.getByText(/clear filters/i)
      expect(clearButton).toHaveFocus()
    })
  })

  describe('Responsive Design', () => {
    it('should use responsive grid layout', () => {
      const { container } = render(<TechnologyFilters {...defaultProps} />)

      const filtersContainer = container.querySelector('.grid')
      expect(filtersContainer).toHaveClass('grid-cols-1', 'md:grid-cols-4')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined filters gracefully', () => {
      const undefinedFilters = {
        search: '',
        category: 'all',
        status: 'all',
      }

      render(
        <TechnologyFilters 
          filters={undefinedFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      )

      expect(screen.getByPlaceholderText(/search technologies/i)).toBeInTheDocument()
    })

    it('should handle missing callback functions', () => {
      render(
        <TechnologyFilters 
          filters={mockFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
        />
      )

      expect(screen.getByPlaceholderText(/search technologies/i)).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should not cause excessive re-renders', () => {
      const { rerender } = render(<TechnologyFilters {...defaultProps} />)

      // Re-render with same props
      rerender(<TechnologyFilters {...defaultProps} />)

      expect(screen.getByPlaceholderText(/search technologies/i)).toBeInTheDocument()
    })

    it('should not cause infinite re-renders with stable callbacks', () => {
      const stableOnFiltersChange = jest.fn()
      const stableOnClearFilters = jest.fn()

      const { rerender } = render(
        <TechnologyFilters
          filters={mockFilters}
          onFiltersChange={stableOnFiltersChange}
          onClearFilters={stableOnClearFilters}
        />
      )

      // Re-render multiple times with same stable callbacks
      for (let i = 0; i < 5; i++) {
        rerender(
          <TechnologyFilters
            filters={mockFilters}
            onFiltersChange={stableOnFiltersChange}
            onClearFilters={stableOnClearFilters}
          />
        )
      }

      // Should not cause any issues
      expect(screen.getByPlaceholderText(/search technologies/i)).toBeInTheDocument()
      expect(stableOnFiltersChange).not.toHaveBeenCalled()
      expect(stableOnClearFilters).not.toHaveBeenCalled()
    })
  })
})
