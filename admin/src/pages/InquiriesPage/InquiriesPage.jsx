import { Link } from 'react-router-dom'
import inquiryService from '../../services/inquiryService.js'
import propertyService from '../../services/propertyService.js'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { formatDateTime } from '../../utils/format.js'
import { statusBadgeColor } from '../../utils/status.js'
import { Table, TableRow, TableCell } from '../../components/ui/Table.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'

export default function InquiriesPage() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const inquiries = await inquiryService.list()
    return Promise.all(
      inquiries.map(async (inquiry) => ({
        ...inquiry,
        propertyTitle: await propertyService
          .get(inquiry.propertyId)
          .then((property) => property.title)
          .catch(() => inquiry.propertyId),
      }))
    )
  })

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
          <Icon name="chat" className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">Inquiries</h1>
          <p className="mt-0.5 text-sm text-gray-500">Questions sent about your properties</p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingState message="Loading inquiries…" />
        ) : error ? (
          <ErrorState title="Unable to load inquiries" message={error?.message} onRetry={reload} />
        ) : !data?.length ? (
          <EmptyState
            title="No inquiries yet"
            message="Inquiries from tenants will appear here."
            icon="chat"
          />
        ) : (
          <Table
            headers={[
              { key: 'tenant', label: 'Tenant' },
              { key: 'property', label: 'Property' },
              { key: 'message', label: 'Message' },
              { key: 'createdAt', label: 'Received' },
              { key: 'status', label: 'Status' },
            ]}
          >
            {data.map((inquiry) => (
              <TableRow key={inquiry.inquiryId}>
                <TableCell className="font-medium text-gray-900">
                  <Link
                    to={`/inquiries/${inquiry.inquiryId}`}
                    className="hover:text-blue-600 hover:underline"
                  >
                    {inquiry.tenant?.name ?? 'Unknown tenant'}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/properties/${inquiry.propertyId}`}
                    className="hover:text-blue-600 hover:underline"
                  >
                    {inquiry.propertyTitle}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="block max-w-xs truncate text-sm text-gray-600">
                    {inquiry.message || '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                    <Icon name="clock" className="h-4 w-4 text-gray-400" />
                    {formatDateTime(inquiry.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  {inquiry.status ? (
                    <Badge color={statusBadgeColor(inquiry.status)}>{inquiry.status}</Badge>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </div>
  )
}
