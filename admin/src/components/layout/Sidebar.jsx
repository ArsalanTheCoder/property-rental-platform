import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', description: 'Overview & Metrics' },
  { to: '/properties', label: 'Properties', icon: 'building', description: 'Listings & Media' },
  { to: '/viewing-requests', label: 'Viewing Requests', icon: 'calendar', description: 'Tours & AI Leads' },
  { to: '/users', label: 'Users & Tenants', icon: 'users', description: 'Accounts & Moderation' },
  { to: '/settings', label: 'Settings', icon: 'cog', description: 'System & Preferences' },
]

export default function Sidebar({ onNavigate }) {
  const { user } = useAuth()

  return (
    <aside
      aria-label="Main navigation"
      className="flex h-full flex-col border-r border-slate-800 bg-slate-900 text-slate-300 select-none shadow-xl"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3.5 border-b border-slate-800/80 px-6 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25">
          <Icon name="home" className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-extrabold tracking-tight text-white">
              HAVEN
            </p>
            <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-indigo-500/30">
              Admin
            </span>
          </div>
          <p className="truncate text-xs font-medium text-slate-400">
            Property Management
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-300">
        Navigation
      </div>
      <ul className="flex-1 space-y-1.5 overflow-y-auto px-3">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800/80 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon name={item.icon} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-white shadow-sm" aria-hidden="true" />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer Profile Pill */}
      <div className="border-t border-slate-800/80 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-2.5 border border-slate-750">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">{user?.name || 'Administrator'}</p>
            <p className="truncate text-[11px] text-slate-400">{user?.email || 'admin@rentalplatform.com'}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
