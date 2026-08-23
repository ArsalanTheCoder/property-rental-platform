import { useAsyncData } from '../../hooks/useAsyncData.js'
import dashboardService from '../../services/dashboardService.js'
import { Card } from '../../components/ui/Card.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'

const statItems = (summary) => [
  {
    label: 'Total properties',
    value: summary.totalProperties,
    icon: 'building',
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Published properties',
    value: summary.publishedProperties,
    icon: 'check',
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Pending properties',
    value: summary.pendingProperties,
    icon: 'clock',
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Total users',
    value: summary.totalUsers,
    icon: 'users',
    iconClass: 'bg-indigo-50 text-indigo-600',
  },
  {
    label: 'Pending inquiries',
    value: summary.pendingInquiries,
    icon: 'chat',
    iconClass: 'bg-violet-50 text-violet-600',
  },
  {
    label: 'Pending viewing requests',
    value: summary.pendingViewingRequests,
    icon: 'calendar',
    iconClass: 'bg-rose-50 text-rose-600',
  },
]

export default function DashboardPage() {
  const { data, loading, error, reload } = useAsyncData(() => dashboardService.getSummary())

  if (loading) {
    return <LoadingState message="Loading dashboard…" />
  }

  if (error) {
    return (
      <ErrorState title="Unable to load dashboard" message={error?.message} onRetry={reload} />
    )
  }

  if (!data) {
    return <EmptyState title="No dashboard data yet" icon="dashboard" />
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Icon name="dashboard" className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Platform summary</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statItems(data).map((item) => (
          <Card
            key={item.label}
            className="group p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{item.value}</p>
              </div>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconClass}`}
              >
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
