import { Icon } from './Icon.jsx'

export function EmptyState({ title = 'Nothing here yet', message, action, icon = 'inbox' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {message && <p className="max-w-sm text-sm leading-relaxed text-gray-500">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
