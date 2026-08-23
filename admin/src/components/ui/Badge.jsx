const dotColors = {
  gray: 'bg-gray-400',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  slate: 'bg-slate-400',
}

const colors = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  red: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  yellow: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200',
  violet: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
  slate: 'bg-slate-100 text-slate-700',
}

export function Badge({ children, color = 'gray', dot = true, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]} ${className}`}
    >
      {dot && <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dotColors[color]}`} />}
      {children}
    </span>
  )
}
