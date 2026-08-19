import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PropertyFormPage from '../../src/pages/PropertyFormPage/PropertyFormPage.jsx'
import { ToastProvider } from '../../src/context/ToastContext.jsx'
import propertyService from '../../src/services/propertyService.js'

vi.mock('../../src/services/propertyService.js', () => ({
  default: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

function renderCreateForm() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/properties/new']}>
        <Routes>
          <Route path="/properties/new" element={<PropertyFormPage />} />
          <Route path="/properties/:propertyId" element={<h1>Property detail</h1>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  )
}

async function fillValidForm(user) {
  await user.type(screen.getByLabelText(/^Title/), 'Modern Loft in the Arts District')
  await user.type(
    screen.getByLabelText(/^Description/),
    'A bright and spacious loft with high ceilings and a fully equipped kitchen in the city center.'
  )
  await user.selectOptions(screen.getByLabelText(/^Property type/), 'apartment')
  await user.type(screen.getByLabelText(/^Location/), 'Art District 5')
  await user.type(screen.getByLabelText(/^Price/), '1500')
  await user.type(screen.getByLabelText(/^Bedrooms/), '2')
  await user.type(screen.getByLabelText(/^Bathrooms/), '1')
  await user.type(screen.getByLabelText(/^Amenities/), 'wifi, parking')
  await user.selectOptions(screen.getByLabelText(/^Availability/), 'available')
}

describe('PropertyFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates required fields on submit and does not submit invalid data', async () => {
    const user = userEvent.setup()
    renderCreateForm()

    await user.click(screen.getByRole('button', { name: /create property/i }))

    expect(await screen.findAllByText('This field is required.')).toHaveLength(8)
    expect(propertyService.create).not.toHaveBeenCalled()
  })

  it('shows format errors for invalid values', async () => {
    const user = userEvent.setup()
    renderCreateForm()

    await user.type(screen.getByLabelText(/^Title/), 'AB')
    await user.type(screen.getByLabelText(/^Description/), 'Too short.')
    await user.type(screen.getByLabelText(/^Price/), '-5')
    await user.type(screen.getByLabelText(/^Location/), 'Somewhere')
    await user.type(screen.getByLabelText(/^Bedrooms/), '2')
    await user.type(screen.getByLabelText(/^Bathrooms/), '1')
    await user.selectOptions(screen.getByLabelText(/^Property type/), 'house')
    await user.selectOptions(screen.getByLabelText(/^Availability/), 'available')
    await user.type(screen.getByLabelText(/^Image URLs/), 'not-a-valid-url')
    await user.click(screen.getByRole('button', { name: /create property/i }))

    expect(await screen.findByText('Must be at least 3 characters.')).toBeInTheDocument()
    expect(screen.getByText('Must be at least 20 characters.')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid number (0 or greater).')).toBeInTheDocument()
    expect(screen.getByText('Enter valid image URLs separated by commas.')).toBeInTheDocument()
    expect(propertyService.create).not.toHaveBeenCalled()
  })

  it('submits valid data and navigates to the created property details', async () => {
    const user = userEvent.setup()
    propertyService.create.mockResolvedValue({
      propertyId: 'prop-010',
      title: 'Modern Loft in the Arts District',
    })
    renderCreateForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create property/i }))

    expect(await screen.findByRole('heading', { name: 'Property detail' })).toBeInTheDocument()
    expect(propertyService.create).toHaveBeenCalledTimes(1)
    expect(propertyService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Modern Loft in the Arts District',
        price: 1500,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['wifi', 'parking'],
        furnished: false,
        status: 'new',
        availability: 'available',
      })
    )
  })

  it('shows an API error banner when creation fails', async () => {
    const user = userEvent.setup()
    propertyService.create.mockRejectedValue(new Error('The server is unavailable.'))
    renderCreateForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create property/i }))

    expect(await screen.findByText('The server is unavailable.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create property/i })).toBeEnabled()
  })

  it('includes locally selected images in the submitted payload as session blob URLs', async () => {
    const user = userEvent.setup()
    URL.createObjectURL = vi.fn((file) => `blob:mock-${file.name}`)
    URL.revokeObjectURL = vi.fn()
    propertyService.create.mockResolvedValue({
      propertyId: 'prop-010',
      title: 'Modern Loft in the Arts District',
    })
    renderCreateForm()

    await fillValidForm(user)
    const input = screen.getByTestId('image-file-input')
    await user.upload(input, [new File(['fake'], 'living.jpg', { type: 'image/jpeg' })])
    expect(await screen.findByText('living.jpg')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /create property/i }))

    expect(await screen.findByRole('heading', { name: 'Property detail' })).toBeInTheDocument()
    expect(propertyService.create).toHaveBeenCalledTimes(1)
    expect(propertyService.create).toHaveBeenCalledWith(
      expect.objectContaining({ images: ['blob:mock-living.jpg'] })
    )
  })
})
