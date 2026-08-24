import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsPage from '../../src/pages/SettingsPage/SettingsPage.jsx'
import { AuthProvider } from '../../src/context/AuthContext.jsx'
import { ToastProvider } from '../../src/context/ToastContext.jsx'
import { sessionStore } from '../../src/utils/sessionStore.js'
import authService from '../../src/services/authService.js'

vi.mock('../../src/services/authService.js', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    getSession: vi.fn(),
    changePassword: vi.fn(),
  },
}))

function renderSettings() {
  return render(
    <ToastProvider>
      <AuthProvider>
        <SettingsPage />
      </AuthProvider>
    </ToastProvider>
  )
}

describe('SettingsPage', () => {
  beforeEach(() => {
    sessionStore.clearSession()
    authService.changePassword.mockReset()
  })

  it('shows the authenticated admin account information', () => {
    sessionStore.setSession({
      token: 'mock-token',
      admin: { id: 'admin-001', name: 'Property Admin', email: 'admin@rental.com' },
    })
    renderSettings()

    expect(screen.getByText('Property Admin')).toBeInTheDocument()
    expect(screen.getByText('admin@rental.com')).toBeInTheDocument()
  })

  it('requires current, new, and confirm passwords on submit', async () => {
    const user = userEvent.setup()
    renderSettings()

    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(await screen.findAllByText('This field is required.')).toHaveLength(3)
  })

  it('rejects a new password shorter than 8 characters', async () => {
    const user = userEvent.setup()
    renderSettings()

    await user.type(screen.getByLabelText(/^Current password/), 'admin123')
    await user.type(screen.getByLabelText(/^New password/), 'short')
    await user.type(screen.getByLabelText(/^Confirm new password/), 'short')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument()
  })

  it('rejects mismatched new password and confirmation', async () => {
    const user = userEvent.setup()
    renderSettings()

    await user.type(screen.getByLabelText(/^Current password/), 'admin123')
    await user.type(screen.getByLabelText(/^New password/), 'password1')
    await user.type(screen.getByLabelText(/^Confirm new password/), 'password2')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
  })

  it('shows an error when the current password is incorrect', async () => {
    const user = userEvent.setup()
    authService.changePassword.mockRejectedValueOnce(new Error('The current password is incorrect.'))

    renderSettings()

    await user.type(screen.getByLabelText(/^Current password/), 'wrong')
    await user.type(screen.getByLabelText(/^New password/), 'password1')
    await user.type(screen.getByLabelText(/^Confirm new password/), 'password1')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(await screen.findByText('The current password is incorrect.')).toBeInTheDocument()
  })

  it('shows a loading state and success feedback on a successful mock change', async () => {
    const user = userEvent.setup()
    authService.changePassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 50)),
    )

    renderSettings()

    await user.type(screen.getByLabelText(/^Current password/), 'admin123')
    await user.type(screen.getByLabelText(/^New password/), 'password1')
    await user.type(screen.getByLabelText(/^Confirm new password/), 'password1')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    const submit = screen.getByRole('button', { name: /change password/i })
    await waitFor(() => expect(submit).toHaveAttribute('aria-busy', 'true'))

    expect(await screen.findByText('Password changed successfully.')).toBeInTheDocument()
  })
})
