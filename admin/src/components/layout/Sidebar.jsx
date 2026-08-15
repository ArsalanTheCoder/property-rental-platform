import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon.jsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/properties', label: 'Properties', icon: 'building' },
  { to: '/inquiries', label: 'Inquiries', icon: 'chat' },
  { to: '/viewing-requests', label: 'Viewing Requests', icon: 'calendar' },
  { to: '/users', label: 'Users', icon: 'users' },
  { to: '/settings', label: 'Settings', icon: 'cog' },
]

export default function Sidebar({ onNavigate }) {
  return (
    <nav
      aria-label="Main navigation"
      className="flex h-full flex-col border-r border-gray-200 bg-white"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <Icon name="home" className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-gray-900">
            Rental Admin
          </p>
          <p className="truncate text-[11px] font-medium text-gray-500">
            Property Management
          </p>
        </div>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    name={item.icon}
                    className={`h-5 w-5 shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden="true" />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-100 px-5 py-3">
        <p className="text-[11px] font-medium text-gray-400">Admin Panel · v0.1.0</p>
      </div>
    </nav>
  )
}
