import {
  filterTechnologies,
  sortTechnologies,
  calculateTechnologyStats,
  getStatusConfig,
  getStatusBadgeVariant,
  getStatusColor,
  getMostUsedTechnologies,
  truncateText,
  formatDate,
  validateTechnologyForm,
  highlightSearchTerm,
  debounce,
  canManageTechnologies,
  canEditTechnology,
  canDeleteTechnology,
  generateId,
  deepClone,
} from '../utils'
import { createMockTechnologies, createMockTechnology, createMockFilters } from './test-utils'
import { Technology, TechnologyFilters } from '../types'

describe('Technology Utils', () => {
  describe('filterTechnologies', () => {
    const technologies = createMockTechnologies(5)
    
    it('should return all technologies when no filters applied', () => {
      const filters = createMockFilters()
      const result = filterTechnologies(technologies, filters)
      expect(result).toHaveLength(5)
    })

    it('should filter by search term in name', () => {
      const filters = createMockFilters({ search: 'Technology 1' })
      const result = filterTechnologies(technologies, filters)
      expect(result).toHaveLength(1)
      expect(result[0].name).toContain('Technology 1')
    })

    it('should filter by search term in description', () => {
      const techWithSpecialDesc = createMockTechnology({
        description: 'Special testing framework'
      })
      const testTechs = [...technologies, techWithSpecialDesc]
      const filters = createMockFilters({ search: 'testing framework' })
      const result = filterTechnologies(testTechs, filters)
      expect(result).toHaveLength(1)
      expect(result[0].description).toContain('testing framework')
    })

    it('should filter by category', () => {
      const filters = createMockFilters({ category: 'Frontend' })
      const result = filterTechnologies(technologies, filters)
      const frontendTechs = result.filter(t => t.category === 'Frontend')
      expect(frontendTechs.length).toBeGreaterThan(0)
      expect(result.every(t => t.category === 'Frontend')).toBe(true)
    })

    it('should filter by status', () => {
      const filters = createMockFilters({ status: 'active' })
      const result = filterTechnologies(technologies, filters)
      expect(result.every(t => t.status === 'active')).toBe(true)
    })

    it('should apply multiple filters simultaneously', () => {
      const filters = createMockFilters({
        search: 'Technology',
        category: 'Frontend',
        status: 'active'
      })
      const result = filterTechnologies(technologies, filters)
      expect(result.every(t => 
        t.name.toLowerCase().includes('technology') &&
        t.category === 'Frontend' &&
        t.status === 'active'
      )).toBe(true)
    })
  })

  describe('sortTechnologies', () => {
    const technologies = [
      createMockTechnology({ name: 'Zebra', userCount: 1 }),
      createMockTechnology({ name: 'Alpha', userCount: 3 }),
      createMockTechnology({ name: 'Beta', userCount: 2 }),
    ]

    it('should sort by name ascending', () => {
      const result = sortTechnologies(technologies, 'name', 'asc')
      expect(result[0].name).toBe('Alpha')
      expect(result[1].name).toBe('Beta')
      expect(result[2].name).toBe('Zebra')
    })

    it('should sort by name descending', () => {
      const result = sortTechnologies(technologies, 'name', 'desc')
      expect(result[0].name).toBe('Zebra')
      expect(result[1].name).toBe('Beta')
      expect(result[2].name).toBe('Alpha')
    })

    it('should sort by userCount ascending', () => {
      const result = sortTechnologies(technologies, 'userCount', 'asc')
      expect(result[0].userCount).toBe(1)
      expect(result[1].userCount).toBe(2)
      expect(result[2].userCount).toBe(3)
    })

    it('should not mutate original array', () => {
      const original = [...technologies]
      sortTechnologies(technologies, 'name', 'asc')
      expect(technologies).toEqual(original)
    })
  })

  describe('calculateTechnologyStats', () => {
    it('should calculate correct statistics', () => {
      const technologies = [
        createMockTechnology({ status: 'active', category: 'Frontend' }),
        createMockTechnology({ status: 'active', category: 'Backend' }),
        createMockTechnology({ status: 'inactive', category: 'Frontend' }),
        createMockTechnology({ status: 'deprecated', category: 'Database' }),
      ]

      const stats = calculateTechnologyStats(technologies)
      
      expect(stats.total).toBe(4)
      expect(stats.active).toBe(2)
      expect(stats.inactive).toBe(1)
      expect(stats.deprecated).toBe(1)
      expect(stats.categories.Frontend).toBe(2)
      expect(stats.categories.Backend).toBe(1)
      expect(stats.categories.Database).toBe(1)
    })

    it('should handle empty array', () => {
      const stats = calculateTechnologyStats([])
      expect(stats.total).toBe(0)
      expect(stats.active).toBe(0)
      expect(stats.inactive).toBe(0)
      expect(stats.deprecated).toBe(0)
    })
  })

  describe('status utilities', () => {
    it('should return correct status config', () => {
      const activeConfig = getStatusConfig('active')
      expect(activeConfig.label).toBe('Active')
      expect(activeConfig.variant).toBe('default')
      expect(activeConfig.icon).toBe('✅')
    })

    it('should return correct badge variant', () => {
      expect(getStatusBadgeVariant('active')).toBe('default')
      expect(getStatusBadgeVariant('inactive')).toBe('secondary')
      expect(getStatusBadgeVariant('deprecated')).toBe('destructive')
    })

    it('should return correct status color', () => {
      expect(getStatusColor('active')).toBe('text-green-500')
      expect(getStatusColor('inactive')).toBe('text-orange-500')
      expect(getStatusColor('deprecated')).toBe('text-red-500')
    })
  })

  describe('getMostUsedTechnologies', () => {
    it('should return most used technologies in descending order', () => {
      const technologies = [
        createMockTechnology({ userCount: 5, status: 'active' }),
        createMockTechnology({ userCount: 10, status: 'active' }),
        createMockTechnology({ userCount: 3, status: 'active' }),
        createMockTechnology({ userCount: 15, status: 'inactive' }), // Should be excluded
      ]

      const result = getMostUsedTechnologies(technologies, 2)
      expect(result).toHaveLength(2)
      expect(result[0].userCount).toBe(10)
      expect(result[1].userCount).toBe(5)
      expect(result.every(t => t.status === 'active')).toBe(true)
    })
  })

  describe('text utilities', () => {
    it('should truncate text correctly', () => {
      const text = 'This is a very long text that should be truncated'
      const result = truncateText(text, 20)
      expect(result).toBe('This is a very long...')
      expect(result.length).toBeLessThanOrEqual(23) // 20 + '...'
    })

    it('should not truncate short text', () => {
      const text = 'Short text'
      const result = truncateText(text, 20)
      expect(result).toBe(text)
    })

    it('should format date correctly', () => {
      const dateString = '2024-01-15T10:30:00.000Z'
      const result = formatDate(dateString)
      expect(result).toMatch(/Jan \d{1,2}, 2024/)
    })

    it('should handle invalid date', () => {
      const invalidDate = 'invalid-date'
      const result = formatDate(invalidDate)
      expect(result).toBe(invalidDate)
    })

    it('should highlight search terms', () => {
      const text = 'React is a JavaScript library'
      const result = highlightSearchTerm(text, 'React')
      expect(result).toBe('<mark>React</mark> is a JavaScript library')
    })
  })

  describe('validateTechnologyForm', () => {
    it('should validate correct form data', () => {
      const validData = {
        name: 'React',
        category: 'Frontend',
        description: 'A JavaScript library for building user interfaces',
        version: '18.2.0',
        documentationUrl: 'https://react.dev'
      }

      const result = validateTechnologyForm(validData)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should return errors for invalid data', () => {
      const invalidData = {
        name: 'A', // Too short
        category: '', // Missing
        description: 'Short', // Too short
        version: 'invalid', // Invalid format
        documentationUrl: 'not-a-url' // Invalid URL
      }

      const result = validateTechnologyForm(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
      expect(result.errors.category).toBeDefined()
      expect(result.errors.description).toBeDefined()
      expect(result.errors.version).toBeDefined()
      expect(result.errors.documentationUrl).toBeDefined()
    })
  })

  describe('permission utilities', () => {
    it('should allow SUPER_ADMIN to manage technologies', () => {
      expect(canManageTechnologies('SUPER_ADMIN')).toBe(true)
      expect(canEditTechnology('SUPER_ADMIN', createMockTechnology())).toBe(true)
      expect(canDeleteTechnology('SUPER_ADMIN', createMockTechnology())).toBe(true)
    })

    it('should not allow other roles to manage technologies', () => {
      expect(canManageTechnologies('ADMIN')).toBe(false)
      expect(canManageTechnologies('USER')).toBe(false)
      expect(canEditTechnology('ADMIN', createMockTechnology())).toBe(false)
      expect(canDeleteTechnology('USER', createMockTechnology())).toBe(false)
    })
  })

  describe('utility functions', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })

    it('should deep clone objects', () => {
      const original = { a: 1, b: { c: 2 } }
      const cloned = deepClone(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
      
      cloned.b.c = 3
      expect(original.b.c).toBe(2)
    })

    it('should debounce function calls', (done) => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      debouncedFn('call1')
      debouncedFn('call2')
      debouncedFn('call3')
      
      expect(mockFn).not.toHaveBeenCalled()
      
      setTimeout(() => {
        expect(mockFn).toHaveBeenCalledTimes(1)
        expect(mockFn).toHaveBeenCalledWith('call3')
        done()
      }, 150)
    })
  })
})
