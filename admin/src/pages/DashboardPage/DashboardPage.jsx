import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import dashboardService from '../../services/dashboardService.js'
import viewingRequestService from '../../services/viewingRequestService.js'
import propertyService from '../../services/propertyService.js'
import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'
import { formatPrice } from '../../utils/format.js'
import { statusBadgeColor } from '../../utils/status.js'

export default function DashboardPage() {
  const navigate = useNavigate()

  // 1. Overall Platform Stats
  const { data: summary, loading: summaryLoading, error: summaryError, reload: reloadSummary } =
    useAsyncData(() => dashboardService.getSummary())

  // 2. Recent Viewings List
  const { data: viewings, loading: viewingsLoading } = useAsyncData(() =>
    viewingRequestService.list()
  )

  // 3. Recent Properties List
  const { data: properties, loading: propertiesLoading } = useAsyncData(() =>
    propertyService.list()
  )

  if (summaryLoading) {
    return <LoadingState message="Loading executive analytics…" />
  }

  if (summaryError) {
    return (
      <ErrorState
        title="Unable to load dashboard data"
        message={summaryError?.message}
        onRetry={reloadSummary}
      />
    )
  }

  const statCards = [
    {
      label: 'Total Properties',
      value: summary?.totalProperties ?? 0,
      subtext: `${summary?.publishedProperties ?? 0} Published · ${summary?.pendingProperties ?? 0} Draft`,
      icon: 'building',
      gradient: 'from-blue-600 to-indigo-600',
      bgGlow: 'bg-blue-500/10 text-blue-600',
      link: '/properties',
    },
    {
      label: 'Published Listings',
      value: summary?.publishedProperties ?? 0,
      subtext: 'Active on Web & Mobile',
      icon: 'check',
      gradient: 'from-emerald-600 to-teal-600',
      bgGlow: 'bg-emerald-500/10 text-emerald-600',
      link: '/properties?status=published',
    },
    {
      label: 'Pending Inquiries & Tours',
      value: summary?.pendingViewingRequests ?? 0,
      subtext: 'Awaiting team confirmation',
      icon: 'calendar',
      gradient: 'from-amber-600 to-orange-600',
      bgGlow: 'bg-amber-500/10 text-amber-600',
      link: '/viewing-requests',
    },
    {
      label: 'Registered Tenants',
      value: summary?.totalUsers ?? 0,
      subtext: 'Verified user accounts',
      icon: 'users',
      gradient: 'from-purple-600 to-pink-600',
      bgGlow: 'bg-purple-500/10 text-purple-600',
      link: '/users',
    },
  ]

  const recentViewings = (viewings || []).slice(0, 5)
  const recentProperties = (properties || []).slice(0, 4)

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Executive Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Real-time rental discovery, inquiries, AI lead evaluation, and property listings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={reloadSummary}>
            <Icon name="cog" className="h-4 w-4 text-slate-500" />
            Refresh Data
          </Button>
          <Button size="sm" onClick={() => navigate('/properties/new')}>
            <Icon name="plus" className="h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className="group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover border-slate-200/80 cursor-pointer"
            onClick={() => navigate(card.link)}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </p>
                <p className="mt-1.5 text-xs font-medium text-slate-500 flex items-center gap-1">
                  <span>{card.subtext}</span>
                </p>
              </div>
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.bgGlow} shadow-sm transition-transform duration-200 group-hover:scale-110`}
              >
                <Icon name={card.icon} className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
              <span>View details</span>
              <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        ))}
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Recent Viewing Requests & AI Lead Score */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="overflow-hidden border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Icon name="calendar" className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Recent Viewing Requests & Inquiries
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tenant tour bookings evaluated with AI lead scoring
                  </p>
                </div>
              </div>

              <Link
                to="/viewing-requests"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                View all ({viewings?.length || 0})
                <Icon name="arrow-right" className="h-3.5 w-3.5" />
              </Link>
            </div>

            {viewingsLoading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading requests…</div>
            ) : recentViewings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-semibold text-slate-700">No viewing requests yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Tenant inquiries from Web and Mobile will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Tenant</th>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">AI Lead Score</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentViewings.map((viewing) => (
                      <tr
                        key={viewing.viewingId}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          {viewing.userName || 'Anonymous Tenant'}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-700 max-w-[180px] truncate">
                          {viewing.propertyTitle || 'Property #' + viewing.propertyId}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">
                          {viewing.date} at {viewing.time}
                        </td>
                        <td className="px-4 py-3.5">
                          {viewing.leadScore ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                viewing.leadScore.score >= 70
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : viewing.leadScore.score >= 40
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              ★ {viewing.leadScore.score}/100
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">Pending AI</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge color={statusBadgeColor(viewing.status)} size="sm">
                            {viewing.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            to={`/viewing-requests/${viewing.viewingId}`}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-indigo-600"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Recent Listings & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Card */}
          <Card className="p-5 border-slate-200/80 shadow-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Quick Management
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                to="/properties/new"
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 font-semibold text-xs text-slate-800 hover:bg-indigo-50/60 hover:border-indigo-200 hover:text-indigo-700 transition-all"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                  <Icon name="plus" className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold">Publish New Listing</p>
                  <p className="text-[11px] text-slate-500 font-normal">Add photos & AI generated copy</p>
                </div>
              </Link>

              <Link
                to="/viewing-requests"
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 font-semibold text-xs text-slate-800 hover:bg-amber-50/60 hover:border-amber-200 hover:text-amber-700 transition-all"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
                  <Icon name="calendar" className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold">Manage Tour Bookings</p>
                  <p className="text-[11px] text-slate-500 font-normal">Confirm or reject inquiries</p>
                </div>
              </Link>

              <Link
                to="/users"
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 font-semibold text-xs text-slate-800 hover:bg-purple-50/60 hover:border-purple-200 hover:text-purple-700 transition-all"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shadow-sm">
                  <Icon name="users" className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold">Inspect Tenant Accounts</p>
                  <p className="text-[11px] text-slate-500 font-normal">Account status & moderation</p>
                </div>
              </Link>
            </div>
          </Card>

          {/* Properties Snippet */}
          <Card className="p-5 border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Latest Properties
              </h3>
              <Link
                to="/properties"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentProperties.map((prop) => (
                <Link
                  key={prop.propertyId}
                  to={`/properties/${prop.propertyId}`}
                  className="flex items-center gap-3 py-3 hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <img
                    src={
                      prop.images?.[0] ||
                      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={prop.title}
                    className="h-12 w-14 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900">{prop.title}</p>
                    <p className="text-[11px] font-semibold text-indigo-600">{formatPrice(prop.price)}/mo</p>
                  </div>
                  <Badge color={statusBadgeColor(prop.status)} size="sm">
                    {prop.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
