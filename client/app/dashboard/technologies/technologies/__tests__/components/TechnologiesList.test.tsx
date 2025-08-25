import React from 'react'
import { render, screen, fireEvent, waitFor } from '../test-utils'
import { TechnologiesList } from '../../TechnologiesList'
import { createMockTechnologies, mockConsoleMethod } from '../test-utils'

// Mock date-fns format function
jest.mock('date-fns', () => ({
  format: jest.fn((date) => 'Jan 1, 2024'),
}))

describe('TechnologiesList Component', () => {
  const mockTechnologies = createMockTechnologies(3)
  const mockProps = {
    technologies: mockTechnologies,
    onTechnologyClick: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    userRole: 'SUPER_ADMIN',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render technologies list correctly', () => {
      render(<TechnologiesList {...mockProps} />)

      // Check table headers
      expect(screen.getByText('Technology')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Version')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Updated')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()

      // Check technology data
      mockTechnologies.forEach(tech => {
        expect(screen.getByText(tech.name)).toBeInTheDocument()
        expect(screen.getByText(tech.category)).toBeInTheDocument()
        expect(screen.getByText(tech.version)).toBeInTheDocument()
      })
    })

    it('should render empty state when no technologies', () => {
      const { mockMethod, restore } = mockConsoleMethod('log')
      
      render(<TechnologiesList {...mockProps} technologies={[]} />)

      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      // EmptyState component should be rendered instead
      
      restore()
    })

    it('should render technology status badges correctly', () => {
      const technologiesWithDifferentStatuses = [
        createMockTechnologies(1)[0],
        { ...createMockTechnologies(1)[0], id: '2', status: 'inactive' as const },
        { ...createMockTechnologies(1)[0], id: '3', status: 'deprecated' as const },
      ]

      render(
        <TechnologiesList 
          {...mockProps} 
          technologies={technologiesWithDifferentStatuses} 
        />
      )

      // Check that status badges are rendered
      const statusElements = screen.getAllByTestId(/status-badge|badge/)
      expect(statusElements.length).toBeGreaterThan(0)
    })

    it('should render user count correctly', () => {
      render(<TechnologiesList {...mockProps} />)

      mockTechnologies.forEach(tech => {
        expect(screen.getByText(tech.userCount.toString())).toBeInTheDocument()
      })
    })

    it('should render formatted dates', () => {
      render(<TechnologiesList {...mockProps} />)

      // Since we mocked date-fns format, it should show our mock date
      const dateElements = screen.getAllByText('Jan 1, 2024')
      expect(dateElements.length).toBeGreaterThan(0)
    })
  })

  describe('Interactions', () => {
    it('should call onTechnologyClick when technology row is clicked', () => {
      render(<TechnologiesList {...mockProps} />)

      const firstTechRow = screen.getByText(mockTechnologies[0].name).closest('tr')
      expect(firstTechRow).toBeInTheDocument()

      if (firstTechRow) {
        fireEvent.click(firstTechRow)
        expect(mockProps.onTechnologyClick).toHaveBeenCalledWith(mockTechnologies[0])
      }
    })

    it('should call onEdit when edit button is clicked', () => {
      render(<TechnologiesList {...mockProps} />)

      const editButtons = screen.getAllByLabelText(/edit/i)
      expect(editButtons.length).toBeGreaterThan(0)

      fireEvent.click(editButtons[0])
      expect(mockProps.onEdit).toHaveBeenCalledWith(mockTechnologies[0])
    })

    it('should show delete confirmation dialog when delete button is clicked', async () => {
      render(<TechnologiesList {...mockProps} />)

      const deleteButtons = screen.getAllByLabelText(/delete/i)
      expect(deleteButtons.length).toBeGreaterThan(0)

      fireEvent.click(deleteButtons[0])

      // Check if confirmation dialog appears
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
      })
    })

    it('should call onDelete when delete is confirmed', async () => {
      render(<TechnologiesList {...mockProps} />)

      const deleteButtons = screen.getAllByLabelText(/delete/i)
      fireEvent.click(deleteButtons[0])

      // Wait for dialog and confirm
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
      })

      const confirmButton = screen.getByText(/delete/i)
      fireEvent.click(confirmButton)

      expect(mockProps.onDelete).toHaveBeenCalledWith(mockTechnologies[0].id)
    })

    it('should open documentation URL when external link is clicked', () => {
      const techWithUrl = {
        ...mockTechnologies[0],
        documentationUrl: 'https://example.com'
      }

      render(
        <TechnologiesList 
          {...mockProps} 
          technologies={[techWithUrl]} 
        />
      )

      const externalLinks = screen.getAllByLabelText(/open documentation/i)
      expect(externalLinks.length).toBeGreaterThan(0)

      // Mock window.open
      const mockOpen = jest.fn()
      global.open = mockOpen

      fireEvent.click(externalLinks[0])
      expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank')
    })
  })

  describe('Permissions', () => {
    it('should hide edit/delete buttons for non-SUPER_ADMIN users', () => {
      render(
        <TechnologiesList 
          {...mockProps} 
          userRole="ADMIN"
          onEdit={undefined}
          onDelete={undefined}
        />
      )

      expect(screen.queryByLabelText(/edit/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/delete/i)).not.toBeInTheDocument()
    })

    it('should show edit/delete buttons for SUPER_ADMIN users', () => {
      render(<TechnologiesList {...mockProps} />)

      expect(screen.getAllByLabelText(/edit/i).length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText(/delete/i).length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(<TechnologiesList {...mockProps} />)

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders).toHaveLength(7) // 7 columns

      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(mockTechnologies.length + 1) // +1 for header row
    })

    it('should have accessible button labels', () => {
      render(<TechnologiesList {...mockProps} />)

      const editButtons = screen.getAllByLabelText(/edit/i)
      const deleteButtons = screen.getAllByLabelText(/delete/i)

      expect(editButtons.length).toBe(mockTechnologies.length)
      expect(deleteButtons.length).toBe(mockTechnologies.length)
    })

    it('should support keyboard navigation', () => {
      render(<TechnologiesList {...mockProps} />)

      const firstRow = screen.getByText(mockTechnologies[0].name).closest('tr')
      expect(firstRow).toBeInTheDocument()

      if (firstRow) {
        // Test keyboard interaction
        fireEvent.keyDown(firstRow, { key: 'Enter', code: 'Enter' })
        expect(mockProps.onTechnologyClick).toHaveBeenCalledWith(mockTechnologies[0])
      }
    })
  })

  describe('Data Display', () => {
    it('should truncate long technology names', () => {
      const techWithLongName = {
        ...mockTechnologies[0],
        name: 'This is a very long technology name that should be truncated'
      }

      render(
        <TechnologiesList 
          {...mockProps} 
          technologies={[techWithLongName]} 
        />
      )

      // The truncated name should be displayed
      const nameElement = screen.getByText(/This is a very long/)
      expect(nameElement).toBeInTheDocument()
    })

    it('should handle missing optional fields gracefully', () => {
      const techWithMissingFields = {
        ...mockTechnologies[0],
        icon: undefined,
        documentationUrl: undefined,
      }

      render(
        <TechnologiesList 
          {...mockProps} 
          technologies={[techWithMissingFields]} 
        />
      )

      // Should render without errors
      expect(screen.getByText(techWithMissingFields.name)).toBeInTheDocument()
    })
  })

  describe('Console Logging', () => {
    it('should log technologies data for debugging', () => {
      const { mockMethod, restore } = mockConsoleMethod('log')

      render(<TechnologiesList {...mockProps} />)

      expect(mockMethod).toHaveBeenCalledWith(
        '📋 TechnologiesList received technologies:',
        expect.objectContaining({
          count: mockTechnologies.length,
          technologies: mockTechnologies
        })
      )

      expect(mockMethod).toHaveBeenCalledWith(
        '✅ TechnologiesList: Rendering',
        mockTechnologies.length,
        'technologies'
      )

      restore()
    })
  })
})
