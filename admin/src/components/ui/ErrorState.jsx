import { Icon } from './Icon.jsx'
import { Button } from './Button.jsx'

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50/60 px-6 py-14 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <Icon name="alert" className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-red-800">{title}</p>
      {message && <p className="max-w-sm text-sm text-red-700">{message}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          <Icon name="refresh" className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  )
}
