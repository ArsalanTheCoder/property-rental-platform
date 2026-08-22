import { useState } from 'react'
import propertyService from '../../services/propertyService.js'
import { getAllowedActions, propertyWorkflow } from '../../config/propertyWorkflow.js'
import { useToast } from '../../context/ToastContext.jsx'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'

// Presentation glue: maps a config action to the real backend status
// transition (PATCH /admin/properties/:id/status via propertyService.updateStatus).
// The transition RULES live exclusively in propertyWorkflow.js (FR-022, FR-023) —
// this component only renders the actions allowed for the current status and
// surfaces the backend's response, never fabricating success (FR-022 scenario 3).

// The canonical workflow path derived entirely from the config, so no status
// names or ordering are hardcoded here: initialStatus → result of each action.
const workflowSteps = [
  propertyWorkflow.initialStatus,
  ...propertyWorkflow.actions.map((action) => action.resultStatus),
]

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1)
}

function WorkflowStepper({ currentStatus }) {
  const currentIndex = workflowSteps.indexOf(currentStatus)

  return (
    <ol className="flex flex-wrap items-center gap-y-2">
      {workflowSteps.map((step, index) => {
        const state =
          index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
        return (
          <li key={step} className="flex items-center">
            {index > 0 && (
              <Icon
                name="chevron-right"
                className="mx-1 h-4 w-4 shrink-0 text-gray-300"
                aria-hidden="true"
              />
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                state === 'current'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : state === 'done'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {state === 'done' && <Icon name="check" className="h-3 w-3" />}
              {capitalize(step)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function WorkflowActions({ property, onChanged, showStepper = true }) {
  const toast = useToast()
  const [pending, setPending] = useState(null)
  const allowed = getAllowedActions(property.status)

  async function run(action) {
    setPending(action.action)
    try {
      const updated = await propertyService.updateStatus(property.propertyId, action.resultStatus)
      toast.success(`Property successfully ${action.resultStatus}.`)
      onChanged?.(updated)
    } catch (err) {
      toast.error(err?.message ?? `Unable to ${action.action.toLowerCase()} the property.`)
    } finally {
      setPending(null)
    }
  }

  return (
    <div className={showStepper ? 'space-y-4' : ''}>
      {showStepper && <WorkflowStepper currentStatus={property.status} />}
      <div className={showStepper ? 'border-t border-gray-100 pt-3' : ''}>
        {allowed.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Next action
            </span>
            {allowed.map((action) => (
              <Button
                key={action.action}
                size="sm"
                onClick={() => run(action)}
                loading={pending === action.action}
                disabled={pending !== null}
              >
                {action.action}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No further workflow actions for status “{property.status}”.
          </p>
        )}
      </div>
    </div>
  )
}
