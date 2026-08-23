import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '../../src/context/AuthContext.jsx'
import ProtectedRoute from '../../src/routes/ProtectedRoute.jsx'
import { sessionStore } from '../../src/utils/sessionStore.js'

const mockSession = {
  token: 'seeded-token',
  admin: { id: 'admin-1', name: 'Admin', email: 'admin@rental.com' },
}

function Probe() {
  const { user, token, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <output data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</output>
      <output data-testid="user">{user?.name ?? 'none'}</output>
      <output data-testid="token">{token ?? 'none'}</output>
      <button onClick={() => login('admin@rental.com', 'admin123')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

function LoginSpy() {
  const location = useLocation()
  return (
    <div>
      <h1>Login page</h1>
      <p data-testid="from">{location.state?.from?.pathname ?? 'no-from'}</p>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    sessionStore.clearSession()
  })

  it('throws when useAuth is used outside an AuthProvider', () => {
    function Throws() {
      useAuth()
      return null
    }
    expect(() => render(<Throws />)).toThrow('useAuth must be used within an AuthProvider')
  })

  it('starts unauthenticated without a persisted session', () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    expect(screen.getByTestId('auth')).toHaveTextContent('no')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('token')).toHaveTextContent('none')
  })

  it('restores a persisted session from storage on mount', () => {
    window.sessionStorage.setItem('admin.session', JSON.stringify(mockSession))
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    expect(screen.getByTestId('auth')).toHaveTextContent('yes')
    expect(screen.getByTestId('user')).toHaveTextContent('Admin')
    expect(screen.getByTestId('token')).toHaveTextContent('seeded-token')
  })

  it('logs in through the mock, sets the session, and persists it', async () => {
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    await user.click(screen.getByRole('button', { name: 'login' }))

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('yes'))
    expect(screen.getByTestId('user')).toHaveTextContent('Admin')
    expect(screen.getByTestId('token')).not.toHaveTextContent('none')

    const persisted = JSON.parse(window.sessionStorage.getItem('admin.session'))
    expect(persisted.token).toBeTruthy()
    expect(persisted.admin.email).toBe('admin@rental.com')
  })

  it('logs out, clears the token, and removes the persisted session', async () => {
    const user = userEvent.setup()
    window.sessionStorage.setItem('admin.session', JSON.stringify(mockSession))
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('yes'))

    await user.click(screen.getByRole('button', { name: 'logout' }))

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('no'))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(window.sessionStorage.getItem('admin.session')).toBeNull()
  })

  it('clears the session when the auth:expired event is dispatched', () => {
    window.sessionStorage.setItem('admin.session', JSON.stringify(mockSession))
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    expect(screen.getByTestId('auth')).toHaveTextContent('yes')

    act(() => {
      window.dispatchEvent(new Event('auth:expired'))
    })

    expect(screen.getByTestId('auth')).toHaveTextContent('no')
    expect(screen.getByTestId('token')).toHaveTextContent('none')
    expect(window.sessionStorage.getItem('admin.session')).toBeNull()
  })
})

describe('ProtectedRoute', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    sessionStore.clearSession()
  })

  function renderProtected() {
    return render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/properties']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/properties" element={<h1>Protected content</h1>} />
            </Route>
            <Route path="/login" element={<LoginSpy />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )
  }

  it('redirects unauthenticated visitors to /login with the attempted location', () => {
    renderProtected()
    expect(screen.getByRole('heading', { name: /login page/i })).toBeInTheDocument()
    expect(screen.getByTestId('from')).toHaveTextContent('/properties')
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders the protected outlet when a session exists', () => {
    window.sessionStorage.setItem('admin.session', JSON.stringify(mockSession))
    renderProtected()
    expect(screen.getByRole('heading', { name: /protected content/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /login page/i })).not.toBeInTheDocument()
  })

  it('locks the route again after the session expires', () => {
    window.sessionStorage.setItem('admin.session', JSON.stringify(mockSession))
    renderProtected()
    expect(screen.getByRole('heading', { name: /protected content/i })).toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event('auth:expired'))
    })

    expect(screen.getByRole('heading', { name: /login page/i })).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })
})
