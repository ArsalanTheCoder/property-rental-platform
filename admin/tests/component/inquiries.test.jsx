import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import InquiriesPage from '../../src/pages/InquiriesPage/InquiriesPage.jsx'
import InquiryDetailPage from '../../src/pages/InquiryDetailPage/InquiryDetailPage.jsx'
import { ToastProvider } from '../../src/context/ToastContext.jsx'
import inquiryService from '../../src/services/inquiryService.js'
import propertyService from '../../src/services/propertyService.js'

vi.mock('../../src/services/inquiryService.js', () => ({
  default: { list: vi.fn(), get: vi.fn() },
}))

vi.mock('../../src/services/propertyService.js', () => ({
  default: { get: vi.fn(), list: vi.fn() },
}))

const mockInquiries = [
  {
    inquiryId: 'inq-001',
    tenant: { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 555 0101' },
    propertyId: 'prop-001',
    message: 'Is the apartment available for a one-year lease?',
    createdAt: '2026-08-11T15:20:00Z',
    status: 'new',
  },
  {
    inquiryId: 'inq-002',
    tenant: { name: 'David Miller', email: 'david@example.com', phone: '+1 555 0104' },
    propertyId: 'prop-002',
    message: 'Do you offer short-term rentals?',
    createdAt: '2026-08-12T10:45:00Z',
    status: undefined,
  },
]

propertyService.get.mockImplementation((propertyId) =>
  Promise.resolve({
    propertyId,
    title: propertyId === 'prop-001' ? 'Sunny Apartment' : 'Cozy Studio',
  })
)

function renderList() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/inquiries']}>
        <Routes>
          <Route path="/inquiries" element={<InquiriesPage />} />
          <Route path="/inquiries/:inquiryId" element={<InquiryDetailPage />} />
          <Route path="/properties/:propertyId" element={<h1>Property detail</h1>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  )
}

function renderDetail(inquiryId) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/inquiries/${inquiryId}`]}>
        <Routes>
          <Route path="/inquiries" element={<InquiriesPage />} />
          <Route path="/inquiries/:inquiryId" element={<InquiryDetailPage />} />
          <Route path="/properties/:propertyId" element={<h1>Property detail</h1>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  )
}

describe('InquiriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the inquiry list with tenant, property, message, and status', async () => {
    inquiryService.list.mockResolvedValue(mockInquiries)
    renderList()

    expect(await screen.findByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('David Miller')).toBeInTheDocument()
    expect(screen.getByText('Sunny Apartment')).toBeInTheDocument()
    expect(screen.getByText('Is the apartment available for a one-year lease?')).toBeInTheDocument()
    expect(screen.getByText('new')).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(1)
  })

  it('shows the empty state when there are no inquiries', async () => {
    inquiryService.list.mockResolvedValue([])
    renderList()

    expect(await screen.findByText('No inquiries yet')).toBeInTheDocument()
  })

  it('shows an error state with retry', async () => {
    const user = userEvent.setup()
    inquiryService.list.mockRejectedValueOnce(new Error('Server unreachable.'))
    inquiryService.list.mockResolvedValueOnce(mockInquiries)
    renderList()

    expect(await screen.findByText('Server unreachable.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(await screen.findByText('Alice Johnson')).toBeInTheDocument()
    expect(inquiryService.list).toHaveBeenCalledTimes(2)
  })

  it('renders inquiry details including tenant and property info', async () => {
    inquiryService.get.mockResolvedValue(mockInquiries[0])
    renderDetail('inq-001')

    expect(await screen.findByText('Inquiry inq-001')).toBeInTheDocument()
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('+1 555 0101')).toBeInTheDocument()
    expect(screen.getByText('Sunny Apartment')).toBeInTheDocument()
    expect(screen.getByText('Is the apartment available for a one-year lease?')).toBeInTheDocument()
    expect(screen.getByText('new')).toBeInTheDocument()
  })

  it('shows an error state on the detail page when the inquiry fails to load', async () => {
    inquiryService.get.mockRejectedValue(new Error('Inquiry not found.'))
    renderDetail('inq-999')

    expect(await screen.findByText('Inquiry not found.')).toBeInTheDocument()
    expect(screen.getByText('Unable to load inquiry')).toBeInTheDocument()
  })
})
