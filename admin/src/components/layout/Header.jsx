import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'

export default function Header({ onMenuClick, menuOpen = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  // Get current section name
  const getPageTitle = () => {
    const path = location.pathname
    if (path.startsWith('/properties/new')) return 'New Property Listing'
    if (path.startsWith('/properties/') && path.endsWith('/edit')) return 'Edit Property'
    if (path.startsWith('/properties/')) return 'Property Overview'
    if (path.startsWith('/properties')) return 'Properties'
    if (path.startsWith('/viewing-requests/')) return 'Viewing Request Details'
    if (path.startsWith('/viewing-requests')) return 'Viewing Requests & Leads'
    if (path.startsWith('/users/')) return 'Tenant Profile'
    if (path.startsWith('/users')) return 'Users & Moderation'
    if (path.startsWith('/settings')) return 'System Settings'
    return 'Dashboard Overview'
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          className="px-2 lg:hidden text-slate-600 hover:text-slate-900"
          onClick={onMenuClick}
          aria-label="Open navigation"
          aria-expanded={menuOpen}
        >
          <Icon name="menu" className="h-5 w-5" />
        </Button>

        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900 truncate">
            {getPageTitle()}
          </h2>
          <p className="hidden text-xs text-slate-500 sm:block">
            HAVEN Platform Control Center
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status Indicators */}
        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 md:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>API & MongoDB Online</span>
        </div>

        {/* Quick Action: New Property */}
        <Link to="/properties/new">
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/25 transition-all hover:bg-indigo-700 hover:shadow-md">
            <Icon name="plus" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Property</span>
          </button>
        </Link>

        {/* Logout Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLogout}
          className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
        >
          <Icon name="logout" className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
