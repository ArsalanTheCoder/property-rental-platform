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
  const initials = String(name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?'
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
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
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <Icon name="users" className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">Users</h1>
          <p className="mt-0.5 text-sm text-gray-500">Registered platform users</p>
        </div>
      </div>

      <form
        onSubmit={applySearch}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-200/50"
      >
        <div className="min-w-[240px] flex-1">
          <Input
            id="userSearch"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email, phone, or user ID"
          />
        </div>
        <Button type="submit" variant="secondary">
          <Icon name="search" className="h-4 w-4" />
          Search
        </Button>
      </form>

      <div className="mt-6">
        {loading ? (
          <LoadingState message="Loading users…" />
        ) : error ? (
          <ErrorState title="Unable to load users" message={error?.message} onRetry={reload} />
        ) : !data?.length ? (
          <EmptyState
            title="No users found"
            message="Try adjusting your search. Users appear here once they register."
            icon="users"
          />
        ) : (
          <Table
            headers={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'status', label: 'Status' },
            ]}
          >
            {data.map((user) => {
              const auth = user['authentication information']
              return (
                <TableRow key={user.userId}>
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} />
                      <Link
                        to={`/users/${user.userId}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {user.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="envelope" className="h-4 w-4 text-gray-400" />
                      {user.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="phone" className="h-4 w-4 text-gray-400" />
                      {user.phone}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge color={auth?.verified ? 'green' : 'gray'}>
                      {auth?.verified ? 'Verified' : 'Unverified'}
                    </Badge>
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
