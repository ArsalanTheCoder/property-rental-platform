import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'

function initials(name) {
  return String(name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A'
}

export default function Header({ onMenuClick, menuOpen = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          className="px-2 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
          aria-expanded={menuOpen}
        >
          <Icon name="menu" className="h-5 w-5" />
        </Button>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {initials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user?.name ?? 'Administrator'}
            </p>
            <p className="hidden truncate text-xs text-gray-500 sm:block">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>
      <Button variant="secondary" onClick={handleLogout}>
        <Icon name="logout" className="h-4 w-4" />
        Log out
      </Button>
    </header>
  )
}
