import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PropertiesPage from '../../src/pages/PropertiesPage/PropertiesPage.jsx'
import PropertyDetailPage from '../../src/pages/PropertyDetailPage/PropertyDetailPage.jsx'
import { ToastProvider } from '../../src/context/ToastContext.jsx'
import propertyService from '../../src/services/propertyService.js'

vi.mock('../../src/services/propertyService.js', () => ({
  default: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

const property = {
  propertyId: 'prop-001',
  title: 'Sunny Apartment',
  description: 'A bright two-bedroom apartment in the city center.',
  propertyType: 'Apartment',
  price: 1500,
  location: 'Downtown',
  bedrooms: 2,
  bathrooms: 1,
  furnished: true,
  availability: 'available',
  status: 'draft',
  amenities: ['wifi'],
  images: [],
}

function renderProperties() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/properties']}>
        <Routes>
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:propertyId" element={<h1>Property detail</h1>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  )
}

function renderPropertyDetail() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/properties/prop-001']}>
        <Routes>
          <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
          <Route path="/properties" element={<h1>Properties list</h1>} />
          <Route path="/properties/:propertyId/edit" element={<h1>Edit property</h1>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  )
}

describe('PropertiesPage states', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the empty state when the list is empty', async () => {
    propertyService.list.mockResolvedValue([])
    renderProperties()

    expect(await screen.findByText('No properties found')).toBeInTheDocument()
    expect(screen.getByText(/try adjusting your search/i)).toBeInTheDocument()
  })

  it('shows a live loading status while the list is pending', async () => {
    propertyService.list.mockReturnValue(new Promise(() => {}))
    renderProperties()

    const status = (await screen.findByText('Loading properties…')).closest('[role="status"]')
    expect(status).toBeInTheDocument()
  })

  it('cancelling the delete dialog leaves the property in place', async () => {
    const user = userEvent.setup()
    propertyService.list.mockResolvedValue([property])
    renderProperties()

    await screen.findByText('Sunny Apartment')
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByRole('dialog', { name: 'Delete property' })).toBeInTheDocument()
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog', { name: 'Delete property' })).not.toBeInTheDocument()
    expect(propertyService.remove).not.toHaveBeenCalled()
    expect(screen.getByText('Sunny Apartment')).toBeInTheDocument()
  })
})

describe('PropertyDetailPage states', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an error state with retry when the property fails to load', async () => {
    const user = userEvent.setup()
    propertyService.get.mockRejectedValueOnce(new Error('Property not found.'))
    propertyService.get.mockResolvedValueOnce(property)
    renderPropertyDetail()

    expect(await screen.findByText('Unable to load property')).toBeInTheDocument()
    expect(screen.getByText('Property not found.')).toBeInTheDocument()
    expect(screen.queryByText('Sunny Apartment')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(await screen.findByRole('heading', { name: 'Sunny Apartment' })).toBeInTheDocument()
    expect(propertyService.get).toHaveBeenCalledTimes(2)
  })

  it('renders the property once it has loaded', async () => {
    propertyService.get.mockResolvedValue(property)
    renderPropertyDetail()

    expect(await screen.findByRole('heading', { name: 'Sunny Apartment' })).toBeInTheDocument()
    expect(screen.getByText('$1,500')).toBeInTheDocument()
    expect(screen.getByText('Downtown')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
