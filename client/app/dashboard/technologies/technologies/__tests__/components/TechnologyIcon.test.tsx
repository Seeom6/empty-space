import React from 'react'
import { render, screen, fireEvent, waitFor } from '../test-utils'
import { TechnologyIcon, TechnologyAvatar } from '../../components/TechnologyIcon'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, onLoad, onError, ...props }: any) => {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        {...props}
        data-testid="optimized-image"
      />
    )
  },
}))

describe('TechnologyIcon Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Emoji Icons', () => {
    it('should render emoji icons correctly', () => {
      render(<TechnologyIcon src="⚛️" alt="React icon" />)
      
      const emojiIcon = screen.getByRole('img', { name: 'React icon' })
      expect(emojiIcon).toBeInTheDocument()
      expect(emojiIcon).toHaveTextContent('⚛️')
    })

    it('should apply correct size for emoji icons', () => {
      render(<TechnologyIcon src="🚀" alt="Rocket" size="lg" />)
      
      const emojiIcon = screen.getByRole('img', { name: 'Rocket' })
      expect(emojiIcon).toHaveClass('w-12', 'h-12')
    })

    it('should handle multi-character emojis', () => {
      render(<TechnologyIcon src="👨‍💻" alt="Developer" />)
      
      const emojiIcon = screen.getByRole('img', { name: 'Developer' })
      expect(emojiIcon).toBeInTheDocument()
      expect(emojiIcon).toHaveTextContent('👨‍💻')
    })
  })

  describe('Image URLs', () => {
    it('should render image URLs with Next.js Image component', () => {
      render(
        <TechnologyIcon 
          src="https://example.com/react-icon.png" 
          alt="React icon" 
        />
      )
      
      const image = screen.getByTestId('optimized-image')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/react-icon.png')
      expect(image).toHaveAttribute('alt', 'React icon')
    })

    it('should handle image load success', async () => {
      render(
        <TechnologyIcon 
          src="https://example.com/icon.png" 
          alt="Test icon" 
        />
      )
      
      const image = screen.getByTestId('optimized-image')
      
      // Initially should show loading state
      expect(image).toHaveClass('opacity-0')
      
      // Simulate successful load
      fireEvent.load(image)
      
      await waitFor(() => {
        expect(image).toHaveClass('opacity-100')
      })
    })

    it('should handle image load error', async () => {
      render(
        <TechnologyIcon 
          src="https://example.com/broken-icon.png" 
          alt="Broken icon" 
        />
      )
      
      const image = screen.getByTestId('optimized-image')
      
      // Simulate error
      fireEvent.error(image)
      
      await waitFor(() => {
        // Should show fallback icon
        expect(screen.getByRole('img', { name: 'Broken icon' })).toBeInTheDocument()
      })
    })

    it('should show loading placeholder initially', () => {
      render(
        <TechnologyIcon 
          src="https://example.com/icon.png" 
          alt="Loading icon" 
        />
      )
      
      const placeholder = document.querySelector('.animate-pulse')
      expect(placeholder).toBeInTheDocument()
    })
  })

  describe('Fallback Icons', () => {
    it('should render fallback icon when no src provided', () => {
      render(<TechnologyIcon alt="No icon" />)
      
      const fallbackIcon = screen.getByRole('img', { name: 'No icon' })
      expect(fallbackIcon).toBeInTheDocument()
    })

    it('should render custom fallback icon', () => {
      const CustomIcon = <div data-testid="custom-fallback">Custom</div>
      
      render(
        <TechnologyIcon 
          alt="Custom fallback" 
          fallbackIcon={CustomIcon}
        />
      )
      
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    })

    it('should render fallback for invalid URLs', () => {
      render(<TechnologyIcon src="invalid-url" alt="Invalid" />)
      
      const fallbackIcon = screen.getByRole('img', { name: 'Invalid' })
      expect(fallbackIcon).toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('should apply small size correctly', () => {
      render(<TechnologyIcon src="⚛️" alt="Small icon" size="sm" />)
      
      const icon = screen.getByRole('img', { name: 'Small icon' })
      expect(icon).toHaveClass('w-6', 'h-6')
    })

    it('should apply medium size correctly', () => {
      render(<TechnologyIcon src="⚛️" alt="Medium icon" size="md" />)
      
      const icon = screen.getByRole('img', { name: 'Medium icon' })
      expect(icon).toHaveClass('w-8', 'h-8')
    })

    it('should apply large size correctly', () => {
      render(<TechnologyIcon src="⚛️" alt="Large icon" size="lg" />)
      
      const icon = screen.getByRole('img', { name: 'Large icon' })
      expect(icon).toHaveClass('w-12', 'h-12')
    })

    it('should apply extra large size correctly', () => {
      render(<TechnologyIcon src="⚛️" alt="XL icon" size="xl" />)
      
      const icon = screen.getByRole('img', { name: 'XL icon' })
      expect(icon).toHaveClass('w-16', 'h-16')
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <TechnologyIcon 
          src="⚛️" 
          alt="Custom styled" 
          className="custom-class" 
        />
      )
      
      const icon = container.firstChild as HTMLElement
      expect(icon).toHaveClass('custom-class')
    })

    it('should maintain base classes with custom className', () => {
      const { container } = render(
        <TechnologyIcon 
          src="⚛️" 
          alt="Base classes" 
          className="additional-class" 
        />
      )
      
      const icon = container.firstChild as HTMLElement
      expect(icon).toHaveClass('w-8', 'h-8', 'additional-class')
    })
  })

  describe('Priority Loading', () => {
    it('should pass priority prop to Next.js Image', () => {
      render(
        <TechnologyIcon 
          src="https://example.com/priority-icon.png" 
          alt="Priority icon" 
          priority={true}
        />
      )
      
      const image = screen.getByTestId('optimized-image')
      expect(image).toHaveAttribute('priority')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for emojis', () => {
      render(<TechnologyIcon src="⚛️" alt="React framework" />)
      
      const icon = screen.getByRole('img', { name: 'React framework' })
      expect(icon).toHaveAttribute('aria-label', 'React framework')
    })

    it('should have proper ARIA attributes for fallback icons', () => {
      render(<TechnologyIcon alt="Fallback icon" />)
      
      const icon = screen.getByRole('img', { name: 'Fallback icon' })
      expect(icon).toHaveAttribute('aria-label', 'Fallback icon')
    })

    it('should have title attribute for tooltips', () => {
      render(<TechnologyIcon src="⚛️" alt="Tooltip test" />)
      
      const icon = screen.getByRole('img', { name: 'Tooltip test' })
      expect(icon).toHaveAttribute('title', 'Tooltip test')
    })
  })
})

describe('TechnologyAvatar Component', () => {
  it('should render with default size', () => {
    render(<TechnologyAvatar src="⚛️" alt="Avatar" />)
    
    const avatar = screen.getByRole('img', { name: 'Avatar' })
    expect(avatar).toBeInTheDocument()
  })

  it('should apply custom size', () => {
    const { container } = render(
      <TechnologyAvatar src="⚛️" alt="Custom size" size={64} />
    )
    
    const avatar = container.firstChild as HTMLElement
    expect(avatar).toHaveStyle({ width: '64px', height: '64px' })
  })

  it('should have rounded styling', () => {
    const { container } = render(
      <TechnologyAvatar src="⚛️" alt="Rounded avatar" />
    )
    
    const avatar = container.firstChild as HTMLElement
    expect(avatar).toHaveClass('rounded-full')
  })

  it('should handle image URLs in avatar format', () => {
    render(
      <TechnologyAvatar 
        src="https://example.com/avatar.png" 
        alt="Image avatar" 
      />
    )
    
    const image = screen.getByTestId('optimized-image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveClass('object-cover')
  })
})

describe('Performance Monitoring', () => {
  it('should log performance metrics in development', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    // Mock development environment
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <TechnologyIcon
        src="https://example.com/perf-test.png"
        alt="Performance test"
      />
    )

    const image = screen.getByTestId('optimized-image')
    fireEvent.load(image)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🖼️ Image loaded'),
        expect.any(Object)
      )
    })

    // Restore environment
    process.env.NODE_ENV = originalEnv
    consoleSpy.mockRestore()
  })

  it('should log error messages in development when image fails to load', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

    // Mock development environment
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <TechnologyIcon
        src="http://localhost:12001/invalid-image.png"
        alt="Invalid image test"
      />
    )

    const image = screen.getByTestId('optimized-image')
    fireEvent.error(image)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🖼️ Failed to load image'),
        expect.stringContaining('localhost:12001'),
        expect.any(Object)
      )
    })

    // Restore environment
    process.env.NODE_ENV = originalEnv
    consoleSpy.mockRestore()
  })
})
