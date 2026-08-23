import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardPage from '../../src/pages/DashboardPage/DashboardPage.jsx'
import dashboardService from '../../src/services/dashboardService.js'

vi.mock('../../src/services/dashboardService.js', () => ({
  default: { getSummary: vi.fn() },
}))

const summary = {
  totalProperties: 12,
  publishedProperties: 4,
  pendingProperties: 2,
  totalUsers: 7,
  pendingInquiries: 1,
  pendingViewingRequests: 5,
}

const labels = [
  'Total properties',
  'Published properties',
  'Pending properties',
  'Total users',
  'Pending inquiries',
  'Pending viewing requests',
]

describe('DashboardPage', () => {
  beforeEach(() => {
    dashboardService.getSummary.mockReset()
  })

  it('renders the six MVP summary statistics from the service', async () => {
    dashboardService.getSummary.mockResolvedValue(summary)
    render(<DashboardPage />)

    for (const label of labels) {
      expect(await screen.findByText(label)).toBeInTheDocument()
    }
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows an error state with retry and recovers without hardcoded statistics', async () => {
    const user = userEvent.setup()
    dashboardService.getSummary.mockRejectedValueOnce(new Error('backend down'))
    dashboardService.getSummary.mockResolvedValueOnce(summary)

    render(<DashboardPage />)

    expect(await screen.findByText(/unable to load dashboard/i)).toBeInTheDocument()
    expect(screen.queryByText('12')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(await screen.findByText('Total properties')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })
})
