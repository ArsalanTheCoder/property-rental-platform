import { Link, useParams } from 'react-router-dom'
import inquiryService from '../../services/inquiryService.js'
import propertyService from '../../services/propertyService.js'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { formatDateTime } from '../../utils/format.js'
import { statusBadgeColor } from '../../utils/status.js'
import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
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

export default function InquiryDetailPage() {
  const { inquiryId } = useParams()
  const { data, loading, error, reload } = useAsyncData(async () => {
    const inquiry = await inquiryService.get(inquiryId)
    const property = await propertyService.get(inquiry.propertyId).catch(() => null)
    return { inquiry, property }
  }, [inquiryId])

  if (loading) {
    return <LoadingState message="Loading inquiry…" />
  }

  if (error) {
    return <ErrorState title="Unable to load inquiry" message={error?.message} onRetry={reload} />
  }

  const { inquiry, property } = data

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/inquiries"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        Back to inquiries
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
          <Icon name="chat" className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Inquiry {inquiry.inquiryId}
          </h1>
          {inquiry.status && (
            <div className="mt-1">
              <Badge color={statusBadgeColor(inquiry.status)}>{inquiry.status}</Badge>
            </div>
          )}
        </div>
      </div>

      <Card className="mt-6">
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
          <Icon name="document-text" className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Message</h2>
        </div>
        <p className="p-5 text-sm leading-relaxed text-gray-700">
          {inquiry.message || 'No message provided.'}
        </p>
      </Card>

      <Card className="mt-6">
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
          <Icon name="building" className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Details</h2>
        </div>
        <dl className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <DetailRow icon="key" label="Inquiry ID" value={inquiry.inquiryId} />
          <DetailRow icon="clock" label="Received" value={formatDateTime(inquiry.createdAt)} />
          <DetailRow icon="user-circle" label="Tenant name" value={inquiry.tenant?.name ?? '—'} />
          <DetailRow icon="envelope" label="Tenant email" value={inquiry.tenant?.email ?? '—'} />
          <DetailRow icon="phone" label="Tenant phone" value={inquiry.tenant?.phone ?? '—'} />
          <DetailRow
            icon="building"
            label="Property"
            value={
              property ? (
                <Link
                  to={`/properties/${inquiry.propertyId}`}
                  className="text-blue-600 hover:underline"
                >
                  {property.title}
                </Link>
              ) : (
                inquiry.propertyId
              )
            }
          />
        </dl>
      </Card>
    </div>
  )
}
