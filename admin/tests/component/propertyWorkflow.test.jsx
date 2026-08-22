import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkflowActions } from '../../src/components/properties/WorkflowActions.jsx'
import { getAllowedActions, propertyWorkflow } from '../../src/config/propertyWorkflow.js'
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
  status: 'draft',
}

describe('WorkflowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders exactly the actions the config allows for the current status', () => {
    renderWorkflow({ ...baseProperty, status: 'draft' })
    const allowed = getAllowedActions('draft')
    expect(allowed.map((a) => a.action)).toEqual(['Publish'])
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Unpublish' })).not.toBeInTheDocument()
  })

  it('shows the config action for each status in the workflow', () => {
    const expectations = {
      draft: ['Publish'],
      pending: ['Publish'],
      published: ['Unpublish'],
    }
    Object.entries(expectations).forEach(([status, names]) => {
      const { unmount } = renderWorkflow({ ...baseProperty, status })
      names.forEach((name) => {
        expect(screen.getByRole('button', { name })).toBeInTheDocument()
      })
      unmount()
    })
  })

  it('renders an action for every configured workflow status (never dead-ends)', () => {
    propertyWorkflow.statuses.forEach((status) => {
      const { unmount } = renderWorkflow({ ...baseProperty, status })
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
      unmount()
    })
  })

  it('calls the config-driven status transition and refreshes on success', async () => {
    const user = userEvent.setup()
    const onChanged = vi.fn()
    propertyService.updateStatus.mockResolvedValue({
      propertyId: 'prop-001',
      status: 'published',
    })
    renderWorkflow({ ...baseProperty, status: 'draft' }, { onChanged })

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(propertyService.updateStatus).toHaveBeenCalledWith('prop-001', 'published')
    expect(onChanged).toHaveBeenCalledTimes(1)
    expect(onChanged).toHaveBeenCalledWith(expect.objectContaining({ status: 'published' }))
    expect(await screen.findByText('Property successfully published.')).toBeInTheDocument()
  })

  it('surfaces the backend rejection without fabricating success', async () => {
    const user = userEvent.setup()
    const onChanged = vi.fn()
    propertyService.updateStatus.mockRejectedValue(
      new Error('Cannot change property status to "published" from "published".')
    )
    renderWorkflow({ ...baseProperty, status: 'draft' }, { onChanged })

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(
      await screen.findByText('Cannot change property status to "published" from "published".')
    ).toBeInTheDocument()
    expect(onChanged).not.toHaveBeenCalled()
  })
})
