import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import viewingRequestService from '../../services/viewingRequestService.js'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { formatDate } from '../../utils/format.js'
import { statusBadgeColor } from '../../utils/status.js'
import { Table, TableRow, TableCell } from '../../components/ui/Table.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ViewingStatusActions } from '../../components/viewingRequests/ViewingStatusActions.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'

export default function ViewingRequestsPage() {
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: rawRequests, loading, error, reload } = useAsyncData(async () => {
    return viewingRequestService.list()
  })

  const requests = (rawRequests || []).filter((req) => {
    if (filterStatus === 'all') return true
    return req.status?.toLowerCase() === filterStatus.toLowerCase()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20">
            <Icon name="calendar" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Viewing Requests & Tenant Inquiries
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              Manage in-person property tours and inspect AI lead seriousness evaluations
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          {['all', 'pending', 'confirmed', 'rejected', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-lg px-3 py-1 text-xs font-bold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="mt-4">
        {loading ? (
          <LoadingState message="Loading viewing inquiries…" />
        ) : error ? (
          <ErrorState
            title="Unable to load viewing requests"
            message={error?.message}
            onRetry={reload}
          />
        ) : !requests.length ? (
          <EmptyState
            title="No viewing inquiries found"
            message={
              filterStatus !== 'all'
                ? `There are currently no viewing requests with status "${filterStatus}".`
                : 'Viewing inquiries submitted by tenants on Web and Mobile will appear here.'
            }
            icon="calendar"
          />
        ) : (
          <Table
            headers={[
              { key: 'user', label: 'Tenant Name' },
              { key: 'property', label: 'Requested Property' },
              { key: 'date', label: 'Tour Date & Time' },
              { key: 'leadScore', label: 'AI Lead Evaluation' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Decision' },
            ]}
          >
            {requests.map((request) => (
              <TableRow key={request.viewingId} className="hover:bg-slate-50/80 transition-colors">
                <TableCell className="font-bold text-slate-900">
                  <Link
                    to={`/viewing-requests/${request.viewingId}`}
                    className="hover:text-indigo-600 hover:underline"
                  >
                    {request.userName || 'Tenant'}
                  </Link>
                </TableCell>
                <TableCell className="font-medium text-slate-700">
                  <Link
                    to={`/properties/${request.propertyId}`}
                    className="hover:text-indigo-600 hover:underline line-clamp-1 max-w-xs"
                  >
                    {request.propertyTitle || 'Property #' + request.propertyId}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Icon name="calendar" className="h-3.5 w-3.5 text-slate-400" />
                    {formatDate(request.date)} at {request.time}
                  </span>
                </TableCell>
                <TableCell>
                  {request.leadScore ? (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs ${
                        request.leadScore.score >= 70
                          ? 'bg-emerald-100 text-emerald-800'
                          : request.leadScore.score >= 40
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      ★ {request.leadScore.score}/100 Score
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Evaluated in detail view</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge color={statusBadgeColor(request.status)}>{request.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ViewingStatusActions request={request} onChanged={reload} />
                    <Link
                      to={`/viewing-requests/${request.viewingId}`}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-indigo-600"
                    >
                      Inspect
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </div>
  )
}
