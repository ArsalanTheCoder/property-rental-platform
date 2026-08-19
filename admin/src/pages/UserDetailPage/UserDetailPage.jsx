import { Link, useParams } from 'react-router-dom'
import userService from '../../services/userService.js'
import { useAsyncData } from '../../hooks/useAsyncData.js'
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

export default function UserDetailPage() {
  const { userId } = useParams()
  const { data: user, loading, error, reload } = useAsyncData(
    () => userService.get(userId),
    [userId]
  )

  if (loading) {
    return <LoadingState message="Loading user…" />
  }

  if (error) {
    return <ErrorState title="Unable to load user" message={error?.message} onRetry={reload} />
  }

  const auth = user['authentication information']

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        Back to users
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-blue-700">
          {String(user.name)
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('')}
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            {user.name}
          </h1>
          <div className="mt-1">
            <Badge color={auth?.verified ? 'green' : 'gray'}>
              {auth?.verified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="mt-6">
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
          <Icon name="user-circle" className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Account details</h2>
        </div>
        <dl className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <DetailRow icon="key" label="User ID" value={user.userId} />
          <DetailRow icon="user-circle" label="Name" value={user.name} />
          <DetailRow icon="envelope" label="Email" value={user.email} />
          <DetailRow icon="phone" label="Phone" value={user.phone} />
          <DetailRow icon="lock" label="Authentication method" value={auth?.method ?? '—'} />
        </dl>
      </Card>

      <Card className="mt-6">
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
          <Icon name="home" className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Favorite properties</h2>
        </div>
        <div className="p-5">
          {user.favorites?.length ? (
            <ul className="space-y-2">
              {user.favorites.map((propertyId) => (
                <li key={propertyId}>
                  <Link
                    to={`/properties/${propertyId}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                  >
                    <Icon name="building" className="h-4 w-4" />
                    {propertyId}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No favorite properties yet.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
