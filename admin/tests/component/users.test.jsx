import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import UsersPage from '../../src/pages/UsersPage/UsersPage.jsx'
import UserDetailPage from '../../src/pages/UserDetailPage/UserDetailPage.jsx'
import userService from '../../src/services/userService.js'

vi.mock('../../src/services/userService.js', () => ({
  default: { list: vi.fn(), get: vi.fn() },
}))

const mockUsers = [
  {
    userId: 'user-001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 555 0101',
    'authentication information': { method: 'email', verified: true },
    favorites: ['prop-001'],
  },
  {
    userId: 'user-002',
    name: 'Bob Williams',
    email: 'bob@example.com',
    phone: '+1 555 0102',
    'authentication information': { method: 'email', verified: false },
    favorites: [],
  },
]

function renderList() {
  return render(
    <MemoryRouter initialEntries={['/users']}>
      <Routes>
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:userId" element={<UserDetailPage />} />
        <Route path="/properties/:propertyId" element={<h1>Property detail</h1>} />
      </Routes>
    </MemoryRouter>
  )
}

function renderDetail(userId) {
  return render(
    <MemoryRouter initialEntries={[`/users/${userId}`]}>
      <Routes>
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:userId" element={<UserDetailPage />} />
        <Route path="/properties/:propertyId" element={<h1>Property detail</h1>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the user list with name, email, phone, and verification status', async () => {
    userService.list.mockResolvedValue(mockUsers)
    renderList()

    expect(await screen.findByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('Bob Williams')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('+1 555 0101')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.getByText('Unverified')).toBeInTheDocument()
  })

  it('sends the search term to the service', async () => {
    const user = userEvent.setup()
    userService.list.mockResolvedValue(mockUsers)
    renderList()

    await screen.findByText('Alice Johnson')
    await user.type(screen.getByLabelText(/^Search/), 'alice')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(userService.list).toHaveBeenLastCalledWith({ search: 'alice' })
  })

  it('shows the empty state when no users match', async () => {
    userService.list.mockResolvedValue([])
    renderList()

    expect(await screen.findByText('No users found')).toBeInTheDocument()
  })

  it('shows an error state with retry', async () => {
    const user = userEvent.setup()
    userService.list.mockRejectedValueOnce(new Error('Server unreachable.'))
    userService.list.mockResolvedValueOnce(mockUsers)
    renderList()

    expect(await screen.findByText('Server unreachable.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(await screen.findByText('Alice Johnson')).toBeInTheDocument()
    expect(userService.list).toHaveBeenCalledTimes(2)
  })

  it('renders the user detail with account details and favorites', async () => {
    userService.get.mockResolvedValue(mockUsers[0])
    renderDetail('user-001')

    expect(await screen.findByRole('heading', { name: 'Alice Johnson' })).toBeInTheDocument()
    expect(screen.getByText('user-001')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('+1 555 0101')).toBeInTheDocument()
    expect(screen.getByText('email')).toBeInTheDocument()
    expect(screen.getByText('prop-001')).toBeInTheDocument()
  })

  it('shows an error state on the detail page when the user fails to load', async () => {
    userService.get.mockRejectedValue(new Error('User not found.'))
    renderDetail('user-999')

    expect(await screen.findByText('User not found.')).toBeInTheDocument()
    expect(screen.getByText('Unable to load user')).toBeInTheDocument()
  })
})
