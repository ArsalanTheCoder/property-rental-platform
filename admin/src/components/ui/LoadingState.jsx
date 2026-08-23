import { Spinner } from './Spinner.jsx'

export function LoadingState({ message = 'Loading…' }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm"
    >
      <Spinner size="lg" />
      <p className="text-sm font-medium text-gray-600">{message}</p>
      <div aria-hidden="true" className="w-full max-w-xs space-y-2">
        <div className="h-2 animate-pulse rounded-full bg-gray-100" />
        <div className="h-2 w-4/5 animate-pulse rounded-full bg-gray-100" />
      </div>
    </div>
  )
}
