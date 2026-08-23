import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import LoginPage from '../../src/pages/LoginPage/LoginPage.jsx'
import { AuthProvider } from '../../src/context/AuthContext.jsx'
import { ToastProvider } from '../../src/context/ToastContext.jsx'

function renderLogin() {
  return render(
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<h1>Dashboard</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('validates required fields on submit', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findAllByText('This field is required.')).toHaveLength(2)
    expect(screen.getByLabelText(/email or username/i)).toBeInvalid()
    expect(screen.getByLabelText(/password/i)).toBeInvalid()
  })

  it('shows an error message on invalid credentials', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email or username/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/invalid email\/username or password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email or username/i)).toHaveValue('wrong@example.com')
  })

  it('shows a loading state and prevents duplicate submission while authenticating', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email or username/i), 'admin@rental.com')
    await user.type(screen.getByLabelText(/password/i), 'admin123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    const submit = screen.getByRole('button', { name: /sign in/i })
    expect(submit).toBeDisabled()
    expect(submit).toHaveAttribute('aria-busy', 'true')

    await waitFor(() => expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument())
  })
})
