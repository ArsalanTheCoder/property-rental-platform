import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../../src/components/ui/ConfirmDialog.jsx'

function renderDialog(props = {}) {
  const confirm = vi.fn()
  const cancel = vi.fn()
  render(
    <ConfirmDialog
      open
      title="Delete property"
      message="Delete this property? This action cannot be undone."
      confirmLabel="Delete"
      onConfirm={confirm}
      onCancel={cancel}
      {...props}
    />
  )
  return { confirm, cancel }
}

describe('ConfirmDialog', () => {
  it('renders an accessible modal labelled by its title and described by its message', () => {
    renderDialog()

    const dialog = screen.getByRole('dialog', { name: 'Delete property' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')

    const message = screen.getByText(/this action cannot be undone/i)
    expect(dialog.getAttribute('aria-describedby')).toBe(message.id)
  })

  it('moves keyboard focus into the dialog when it opens', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })

  it('calls onCancel when Escape is pressed', async () => {
    const user = userEvent.setup()
    const { cancel } = renderDialog()

    await user.keyboard('{Escape}')

    expect(cancel).toHaveBeenCalled()
  })
})
