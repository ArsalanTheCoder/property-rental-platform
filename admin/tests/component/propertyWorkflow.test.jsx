import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkflowActions } from '../../src/components/properties/WorkflowActions.jsx'
import { getAllowedActions, propertyWorkflow } from '../../src/config/propertyWorkflow.js'
import { ToastProvider } from '../../src/context/ToastContext.jsx'
import propertyService from '../../src/services/propertyService.js'

vi.mock('../../src/services/propertyService.js', () => ({
  default: {
    review: vi.fn(),
    approve: vi.fn(),
    publish: vi.fn(),
  },
}))

function renderWorkflow(property, { onChanged = vi.fn() } = {}) {
  return render(
    <ToastProvider>
      <WorkflowActions property={property} onChanged={onChanged} />
    </ToastProvider>
  )
}

const baseProperty = {
  propertyId: 'prop-001',
  title: 'Sunny Apartment',
  status: 'new',
}

describe('WorkflowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders exactly the actions the config allows for the current status', () => {
    renderWorkflow({ ...baseProperty, status: 'new' })
    const allowed = getAllowedActions('new')
    expect(allowed.map((a) => a.action)).toEqual(['Review'])
    expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument()
  })

  it('shows the config action for each status in the workflow', () => {
    const expectations = {
      new: ['Review'],
      reviewed: ['Approve'],
      approved: ['Publish'],
    }
    Object.entries(expectations).forEach(([status, names]) => {
      const { unmount } = renderWorkflow({ ...baseProperty, status })
      names.forEach((name) => {
        expect(screen.getByRole('button', { name })).toBeInTheDocument()
      })
      unmount()
    })
  })

  it('shows a message instead of actions for terminal statuses', () => {
    renderWorkflow({ ...baseProperty, status: 'published' })
    expect(screen.getByText(/no further workflow actions/i)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls the config-driven service method and refreshes on success', async () => {
    const user = userEvent.setup()
    const onChanged = vi.fn()
    propertyService.review.mockResolvedValue({ ...baseProperty, status: 'reviewed' })
    renderWorkflow({ ...baseProperty, status: 'new' }, { onChanged })

    await user.click(screen.getByRole('button', { name: 'Review' }))

    expect(propertyService.review).toHaveBeenCalledWith('prop-001')
    expect(onChanged).toHaveBeenCalledTimes(1)
    expect(onChanged).toHaveBeenCalledWith(expect.objectContaining({ status: 'reviewed' }))
    expect(await screen.findByText('Property successfully reviewed.')).toBeInTheDocument()
  })

  it('surfaces the backend rejection without fabricating success', async () => {
    const user = userEvent.setup()
    const onChanged = vi.fn()
    propertyService.review.mockRejectedValue(
      new Error('Cannot Review a property in status "published".')
    )
    renderWorkflow({ ...baseProperty, status: 'new' }, { onChanged })

    await user.click(screen.getByRole('button', { name: 'Review' }))

    expect(await screen.findByText('Cannot Review a property in status "published".')).toBeInTheDocument()
    expect(onChanged).not.toHaveBeenCalled()
  })
})
