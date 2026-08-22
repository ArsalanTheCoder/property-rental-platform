import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ViewingRequestsPage from '../../src/pages/ViewingRequestsPage/ViewingRequestsPage.jsx'
import ViewingRequestDetailPage from '../../src/pages/ViewingRequestDetailPage/ViewingRequestDetailPage.jsx'
import { ToastProvider } from '../../src/context/ToastContext.jsx'
import { getAllowedViewingActions } from '../../src/config/viewingRequestWorkflow.js'
import viewingRequestService from '../../src/services/viewingRequestService.js'
import propertyService from '../../src/services/propertyService.js'

vi.mock('../../src/services/viewingRequestService.js', () => ({
  default: { list: vi.fn(), get: vi.fn(), updateStatus: vi.fn() },
}))

vi.mock('../../src/services/propertyService.js', () => ({
  default: { get: vi.fn(), list: vi.fn() },
}))

const mockRequests = [
  {
    viewingId: 'view-001',
    userId: 'user-001',
    propertyId: 'prop-001',
    userName: 'Alice Johnson',
    userPhone: '+1 555 0101',
    date: '2026-08-20',
    time: '10:00',
    message: 'Interested in a weekend viewing.',
    status: 'pending',
    createdAt: '2026-08-12T09:30:00Z',
  },
  {
    viewingId: 'view-003',
    userId: 'user-003',
    propertyId: 'prop-002',
    userName: 'Carol Chen',
    userPhone: '+1 555 0103',
    date: '2026-08-15',
    time: '09:30',
    message: '',
    status: 'confirmed',
    createdAt: '2026-08-10T08:15:00Z',
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
      <MemoryRouter initialEntries={['/viewing-requests']}>
        <Routes>
          <Route path="/viewing-requests" element={<ViewingRequestsPage />} />
          <Route path="/viewing-requests/:viewingId" element={<ViewingRequestDetailPage />} />
          <Route path="/properties/:propertyId" element={<h1>Property detail</h1>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  )
}

function renderDetail(viewingId) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/viewing-requests/${viewingId}`]}>
        <Routes>
          <Route path="/viewing-requests" element={<ViewingRequestsPage />} />
          <Route path="/viewing-requests/:viewingId" element={<ViewingRequestDetailPage />} />
          <Route path="/properties/:propertyId" element={<h1>Property detail</h1>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  )
}

describe('ViewingRequestsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the list with tenant, property, date, time, and status', async () => {
    viewingRequestService.list.mockResolvedValue(mockRequests)
    renderList()

    expect(await screen.findByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('Carol Chen')).toBeInTheDocument()
    expect(screen.getByText('Sunny Apartment')).toBeInTheDocument()
    expect(screen.getAllByText('pending')).toHaveLength(1)
    expect(screen.getByText('confirmed')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('renders only the config-allowed status actions for each status', async () => {
    viewingRequestService.list.mockResolvedValue(mockRequests)
    renderList()

    await screen.findByText('Alice Johnson')

    const pendingActions = getAllowedViewingActions('pending').map((a) => a.action)
    const confirmedActions = getAllowedViewingActions('confirmed').map((a) => a.action)

    // Actions unique to a single row.
    expect(pendingActions).toEqual(['Confirm', 'Reject', 'Cancel'])
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()

    expect(confirmedActions).toEqual(['Cancel', 'Mark completed'])
    expect(screen.getByRole('button', { name: 'Mark completed' })).toBeInTheDocument()

    // Cancel is allowed from both Pending and Confirmed, so it renders twice.
    expect(screen.getAllByRole('button', { name: 'Cancel' })).toHaveLength(2)
    expect(screen.getAllByRole('button')).toHaveLength(3 + 2)
  })

  it('updates the status and refreshes on success', async () => {
    const user = userEvent.setup()
    viewingRequestService.list.mockResolvedValue(mockRequests)
    viewingRequestService.updateStatus.mockResolvedValue({
      ...mockRequests[0],
      status: 'confirmed',
    })
    renderList()

    await screen.findByText('Alice Johnson')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(viewingRequestService.updateStatus).toHaveBeenCalledWith('view-001', 'confirmed')
    expect(await screen.findByText('Viewing request status updated to confirmed.')).toBeInTheDocument()
  })

  it('surfaces the backend rejection for a forbidden transition without fabricating success', async () => {
    const user = userEvent.setup()
    viewingRequestService.list.mockResolvedValue(mockRequests)
    viewingRequestService.updateStatus.mockRejectedValue(
      new Error('Cannot change viewing request status to "completed" from "pending".')
    )
    renderList()

    await screen.findByText('Alice Johnson')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(
      await screen.findByText('Cannot change viewing request status to "completed" from "pending".')
    ).toBeInTheDocument()
  })

  it('renders the detail page with all viewing request fields', async () => {
    viewingRequestService.get.mockResolvedValue(mockRequests[0])
    renderDetail('view-001')

    expect(await screen.findByText('Viewing request view-001')).toBeInTheDocument()
    expect(screen.getByText('user-001')).toBeInTheDocument()
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('+1 555 0101')).toBeInTheDocument()
    expect(screen.getByText('Sunny Apartment')).toBeInTheDocument()
    expect(screen.getByText('Interested in a weekend viewing.')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
  })
})
