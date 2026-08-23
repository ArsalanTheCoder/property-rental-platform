import { useState } from 'react'
import viewingRequestService from '../../services/viewingRequestService.js'
import { getAllowedViewingActions } from '../../config/viewingRequestWorkflow.js'
import { useToast } from '../../context/ToastContext.jsx'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'

// Presentation glue: renders the status actions the config allows for the
// current status and surfaces the backend's response for each transition
// (FR-031, FR-032). The transition RULES live exclusively in
// viewingRequestWorkflow.js.
const ACTION_STYLE = {
  Confirm: 'primary',
  Reject: 'danger',
  Cancel: 'secondary',
  'Mark completed': 'primary',
}

const ACTION_ICON = {
  Confirm: 'check',
  Reject: 'x-mark',
  Cancel: 'x-mark',
  'Mark completed': 'check',
}

export function ViewingStatusActions({ request, onChanged }) {
  const toast = useToast()
  const [pending, setPending] = useState(null)
  const allowed = getAllowedViewingActions(request.status)

  if (!allowed.length) {
    return (
      <p className="text-sm text-gray-500">
        No further status changes for “{request.status}”.
      </p>
    )
  }

  async function run(action) {
    setPending(action.action)
    try {
      const updated = await viewingRequestService.updateStatus(
        request.viewingId,
        action.resultStatus
      )
      toast.success(`Viewing request status updated to ${action.resultStatus}.`)
      onChanged?.(updated)
    } catch (err) {
      toast.error(err?.message ?? `Unable to ${action.action.toLowerCase()} the viewing request.`)
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {allowed.map((action) => (
        <Button
          key={action.action}
          size="sm"
          variant={ACTION_STYLE[action.action] ?? 'primary'}
          onClick={() => run(action)}
          loading={pending === action.action}
          disabled={pending !== null}
        >
          <Icon name={ACTION_ICON[action.action] ?? 'check'} className="h-3.5 w-3.5" />
          {action.action}
        </Button>
      ))}
    </div>
  )
}
