import { Link, useParams } from 'react-router-dom'
import viewingRequestService from '../../services/viewingRequestService.js'
import propertyService from '../../services/propertyService.js'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { formatDate, formatDateTime } from '../../utils/format.js'
import { statusBadgeColor } from '../../utils/status.js'
import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { ViewingStatusActions } from '../../components/viewingRequests/ViewingStatusActions.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        <Icon name={icon} className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-gray-900">{value}</dd>
      </div>
    </div>
  )
}

export default function ViewingRequestDetailPage() {
  const { viewingId } = useParams()
  const { data, loading, error, reload } = useAsyncData(async () => {
    const request = await viewingRequestService.get(viewingId)
    const property = await propertyService.get(request.propertyId).catch(() => null)
    return { request, property }
  }, [viewingId])

  if (loading) {
    return <LoadingState message="Loading viewing request…" />
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load viewing request"
        message={error?.message}
        onRetry={reload}
      />
    )
  }

  const { request, property } = data

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/viewing-requests"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        Back to viewing requests
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
          <Icon name="calendar" className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Viewing request {request.viewingId}
          </h1>
          <div className="mt-1">
            <Badge color={statusBadgeColor(request.status)}>{request.status}</Badge>
          </div>
        </div>
      </div>

      <Card className="mt-6">
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
          <Icon name="building" className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Details</h2>
        </div>
        <dl className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <DetailRow icon="key" label="Viewing ID" value={request.viewingId} />
          <DetailRow icon="key" label="User ID" value={request.userId} />
          <DetailRow icon="user-circle" label="Tenant name" value={request.userName} />
          <DetailRow icon="phone" label="Tenant phone" value={request.userPhone} />
          <DetailRow
            icon="building"
            label="Property"
            value={property ? property.title : request.propertyId}
          />
          <DetailRow icon="key" label="Property ID" value={request.propertyId} />
          <DetailRow icon="calendar" label="Requested date" value={formatDate(request.date)} />
          <DetailRow icon="clock" label="Requested time" value={request.time} />
          <DetailRow icon="clock" label="Created" value={formatDateTime(request.createdAt)} />
        </dl>
        <div className="border-t border-gray-100 px-5 py-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Message</dt>
          <dd className="mt-1 text-sm text-gray-900">{request.message || '—'}</dd>
        </div>
      </Card>

      <Card className="mt-6">
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
          <Icon name="shield-check" className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Update status</h2>
        </div>
        <div className="p-5">
          <ViewingStatusActions request={request} onChanged={reload} />
        </div>
      </Card>
    </div>
  )
}
