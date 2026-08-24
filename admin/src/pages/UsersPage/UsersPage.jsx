import { useState } from 'react'
import { Link } from 'react-router-dom'
import userService from '../../services/userService.js'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { Table, TableRow, TableCell } from '../../components/ui/Table.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { Input } from '../../components/ui/Field.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'

function Avatar({ name }) {
  const initials =
    String(name ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-700 border border-indigo-200">
      {initials}
    </div>
  )
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  const { data, loading, error, reload } = useAsyncData(
    () => userService.list({ search: query }),
    [query]
  )

  function applySearch(event) {
    event.preventDefault()
    setQuery(search.trim())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
          <Icon name="users" className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Tenants & Registered Users
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Inspect tenant accounts, email verification states, and access moderation
          </p>
        </div>
      </div>

      <form
        onSubmit={applySearch}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card"
      >
        <div className="min-w-[280px] flex-1">
          <Input
            id="userSearch"
            label="Search Users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or user ID"
          />
        </div>
        <Button type="submit" variant="secondary">
          <Icon name="search" className="h-4 w-4 mr-1.5" />
          Search
        </Button>
      </form>

      <div>
        {loading ? (
          <LoadingState message="Loading registered users…" />
        ) : error ? (
          <ErrorState title="Unable to load users" message={error?.message} onRetry={reload} />
        ) : !data?.length ? (
          <EmptyState
            title="No users found"
            message="Try adjusting your search. Users appear here once they register on Web or Mobile."
            icon="users"
          />
        ) : (
          <Table
            headers={[
              { key: 'name', label: 'Tenant Name' },
              { key: 'email', label: 'Email Address' },
              { key: 'verification', label: 'Email Verification' },
              { key: 'role', label: 'Role' },
              { key: 'status', label: 'Account Status' },
              { key: 'actions', label: 'Actions' },
            ]}
          >
            {data.map((user) => {
              const auth = user['authentication information']
              return (
                <TableRow key={user.userId} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} />
                      <Link
                        to={`/users/${user.userId}`}
                        className="hover:text-indigo-600 hover:underline"
                      >
                        {user.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Icon name="envelope" className="h-3.5 w-3.5 text-slate-400" />
                      {user.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    {auth?.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Icon name="check" className="h-3 w-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Unverified
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                      {user.role || 'TENANT'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <Badge color="red" dot={true}>
                        Blocked / Suspended
                      </Badge>
                    ) : (
                      <Badge color="green" dot={true}>
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/users/${user.userId}`}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-indigo-600"
                    >
                      Inspect Profile
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </Table>
        )}
      </div>
    </div>
  )
}
