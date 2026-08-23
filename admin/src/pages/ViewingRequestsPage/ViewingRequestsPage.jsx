import { Link } from 'react-router-dom'
import viewingRequestService from '../../services/viewingRequestService.js'
import propertyService from '../../services/propertyService.js'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { formatDate, formatDateTime } from '../../utils/format.js'
import { statusBadgeColor } from '../../utils/status.js'
import { Table, TableRow, TableCell } from '../../components/ui/Table.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { ViewingStatusActions } from '../../components/viewingRequests/ViewingStatusActions.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'

export default function ViewingRequestsPage() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const requests = await viewingRequestService.list()
    return Promise.all(
      requests.map(async (request) => ({
        ...request,
        propertyTitle: await propertyService
          .get(request.propertyId)
          .then((property) => property.title)
          .catch(() => request.propertyId),
      }))
    )
  })

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
          <Icon name="calendar" className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Viewing Requests
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Requests from tenants to view properties
          </p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingState message="Loading viewing requests…" />
        ) : error ? (
          <ErrorState
            title="Unable to load viewing requests"
            message={error?.message}
            onRetry={reload}
          />
        ) : !data?.length ? (
          <EmptyState
            title="No viewing requests yet"
            message="Viewing requests from tenants will appear here."
            icon="calendar"
          />
        ) : (
          <Table
            headers={[
              { key: 'user', label: 'Tenant' },
              { key: 'property', label: 'Property' },
              { key: 'date', label: 'Requested date' },
              { key: 'time', label: 'Time' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions' },
            ]}
          >
            {data.map((request) => (
              <TableRow key={request.viewingId}>
                <TableCell className="font-medium text-gray-900">
                  <Link
                    to={`/viewing-requests/${request.viewingId}`}
                    className="hover:text-blue-600 hover:underline"
                  >
                    {request.userName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/properties/${request.propertyId}`}
                    className="hover:text-blue-600 hover:underline"
                  >
                    {request.propertyTitle}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                    <Icon name="calendar" className="h-4 w-4 text-gray-400" />
                    {formatDate(request.date)}
                  </span>
                </TableCell>
                <TableCell>{request.time}</TableCell>
                <TableCell>
                  <Badge color={statusBadgeColor(request.status)}>{request.status}</Badge>
                </TableCell>
                <TableCell>
                  <ViewingStatusActions request={request} onChanged={reload} />
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </div>
  )
}
