import { http, HttpResponse } from 'msw'
import { createMockTechnologies, createMockTechnology } from '../test-utils'

const BASE_URL = 'http://localhost:12001/api/v1'

// Mock data
const mockTechnologies = createMockTechnologies(5)
const mockStats = {
  count: [{ count: mockTechnologies.length }],
  status: [
    { status: 'ACTIVE', count: mockTechnologies.filter(t => t.status === 'active').length },
    { status: 'INACTIVE', count: mockTechnologies.filter(t => t.status === 'inactive').length },
  ],
}

export const handlers = [
  // Get all technologies
  http.get(`${BASE_URL}/admin/technology/all`, () => {
    return HttpResponse.json({
      data: mockTechnologies.map(tech => ({
        ...tech,
        status: tech.status.toUpperCase(), // API returns uppercase status
        website: tech.documentationUrl,
      }))
    })
  }),

  // Get technology statistics
  http.get(`${BASE_URL}/admin/technology`, () => {
    return HttpResponse.json(mockStats)
  }),

  // Get technology by ID
  http.get(`${BASE_URL}/admin/technology/:id`, ({ params }) => {
    const { id } = params
    const technology = mockTechnologies.find(t => t.id === id)
    
    if (!technology) {
      return HttpResponse.json(
        { message: 'Technology not found', code: '10001' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      ...technology,
      status: technology.status.toUpperCase(),
      website: technology.documentationUrl,
    })
  }),

  // Create technology
  http.post(`${BASE_URL}/admin/technology`, async ({ request }) => {
    const body = await request.json() as any
    
    // Validate required fields
    if (!body.name || !body.description || !body.category) {
      return HttpResponse.json(
        { message: 'Missing required fields', code: '10000' },
        { status: 400 }
      )
    }

    // Check if technology already exists
    const exists = mockTechnologies.some(t => t.name.toLowerCase() === body.name.toLowerCase())
    if (exists) {
      return HttpResponse.json(
        { message: 'Technology already exists', code: '10002' },
        { status: 409 }
      )
    }

    const newTechnology = createMockTechnology({
      id: `new-tech-${Date.now()}`,
      name: body.name,
      description: body.description,
      category: body.category,
      version: body.version || '1.0.0',
      icon: body.icon,
      documentationUrl: body.website,
    })

    mockTechnologies.push(newTechnology)

    return HttpResponse.json({
      ...newTechnology,
      status: newTechnology.status.toUpperCase(),
      website: newTechnology.documentationUrl,
    }, { status: 201 })
  }),

  // Update technology
  http.put(`${BASE_URL}/admin/technology/:id`, async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as any
    
    const technologyIndex = mockTechnologies.findIndex(t => t.id === id)
    if (technologyIndex === -1) {
      return HttpResponse.json(
        { message: 'Technology not found', code: '10001' },
        { status: 404 }
      )
    }

    // Check if name conflicts with another technology
    const nameConflict = mockTechnologies.some(
      (t, index) => index !== technologyIndex && t.name.toLowerCase() === body.name.toLowerCase()
    )
    if (nameConflict) {
      return HttpResponse.json(
        { message: 'Technology name already exists', code: '10002' },
        { status: 409 }
      )
    }

    const updatedTechnology = {
      ...mockTechnologies[technologyIndex],
      ...body,
      status: body.status?.toLowerCase() || mockTechnologies[technologyIndex].status,
      documentationUrl: body.website || mockTechnologies[technologyIndex].documentationUrl,
      updatedAt: new Date().toISOString(),
    }

    mockTechnologies[technologyIndex] = updatedTechnology

    return HttpResponse.json({
      ...updatedTechnology,
      status: updatedTechnology.status.toUpperCase(),
      website: updatedTechnology.documentationUrl,
    })
  }),

  // Delete technology
  http.delete(`${BASE_URL}/admin/technology/:id`, ({ params }) => {
    const { id } = params
    const technologyIndex = mockTechnologies.findIndex(t => t.id === id)
    
    if (technologyIndex === -1) {
      return HttpResponse.json(
        { message: 'Technology not found', code: '10001' },
        { status: 404 }
      )
    }

    const deletedTechnology = mockTechnologies[technologyIndex]
    mockTechnologies.splice(technologyIndex, 1)

    return HttpResponse.json({
      ...deletedTechnology,
      status: deletedTechnology.status.toUpperCase(),
      website: deletedTechnology.documentationUrl,
    })
  }),

  // Auth error simulation
  http.get(`${BASE_URL}/admin/technology/auth-error`, () => {
    return HttpResponse.json(
      { message: 'Access token not exist', code: '4013' },
      { status: 401 }
    )
  }),
]
