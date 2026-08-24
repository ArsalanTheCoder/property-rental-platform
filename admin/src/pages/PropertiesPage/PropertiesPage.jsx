import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import propertyService from '../../services/propertyService.js'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { propertyWorkflow } from '../../config/propertyWorkflow.js'
import { formatPrice } from '../../utils/format.js'
import { statusBadgeColor } from '../../utils/status.js'
import { useToast } from '../../context/ToastContext.jsx'
import { Table, TableRow, TableCell } from '../../components/ui/Table.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { Input, Select } from '../../components/ui/Field.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { WorkflowActions } from '../../components/properties/WorkflowActions.jsx'

const FILTER_ALL = 'all'

function availabilityColor(availability) {
  if (availability === 'available') return 'green'
  if (availability === 'rented') return 'slate'
  return 'yellow'
}

function PropertyThumb({ images, title }) {
  if (!images?.length) {
    return (
      <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
        <Icon name="photo" className="h-5 w-5" />
      </div>
    )
  }
  return (
    <img
      src={images[0]}
      alt={title}
      className="h-12 w-16 rounded-lg object-cover"
      referrerPolicy="no-referrer"
    />
  )
}

export default function PropertiesPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(FILTER_ALL)
  const [availability, setAvailability] = useState(FILTER_ALL)
  const [propertyType, setPropertyType] = useState(FILTER_ALL)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { data, loading, error, reload } = useAsyncData(
    () => propertyService.list({ search: query, status, availability, propertyType }),
    [query, status, availability, propertyType]
  )

  function applySearch(event) {
    event.preventDefault()
    setQuery(search.trim())
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await propertyService.remove(deleteTarget.propertyId)
      toast.success('Property deleted successfully.')
      setDeleteTarget(null)
      await reload()
    } catch (err) {
      toast.error(err?.message ?? 'Unable to delete the property.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Icon name="building" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Properties
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">Manage rental properties</p>
          </div>
        </div>
        <Button onClick={() => navigate('/properties/new')}>
          <Icon name="plus" className="h-4 w-4" />
          Add property
        </Button>
      </div>

      <form
        onSubmit={applySearch}
        className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-200/50 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <Input
            id="propertySearch"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title or location"
          />
        </div>
        <div>
          <Select
            id="propertyStatusFilter"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value={FILTER_ALL}>All statuses</option>
            {propertyWorkflow.statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Select
            id="propertyAvailabilityFilter"
            label="Availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value={FILTER_ALL}>All availability</option>
            {propertyWorkflow.availability.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Select
            id="propertyTypeFilter"
            label="Type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            <option value={FILTER_ALL}>All types</option>
            {propertyWorkflow.propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <Button type="submit" variant="secondary" size="sm">
            <Icon name="search" className="h-4 w-4" />
            Search
          </Button>
        </div>
      </form>

      <div className="mt-6">
        {loading ? (
          <LoadingState message="Loading properties…" />
        ) : error ? (
          <ErrorState title="Unable to load properties" message={error?.message} onRetry={reload} />
        ) : !data?.length ? (
          <EmptyState
            title="No properties found"
            message="Try adjusting your search or add a new property."
            icon="building"
            action={
              <Button onClick={() => navigate('/properties/new')}>
                <Icon name="plus" className="h-4 w-4" />
                Add property
              </Button>
            }
          />
        ) : (
          <Table
            headers={[
              { key: 'image', label: 'Image' },
              { key: 'title', label: 'Title' },
              { key: 'type', label: 'Type' },
              { key: 'location', label: 'Location' },
              { key: 'price', label: 'Price' },
              { key: 'bedrooms', label: 'Bedrooms' },
              { key: 'status', label: 'Status' },
              { key: 'availability', label: 'Availability' },
              { key: 'actions', label: 'Actions' },
            ]}
          >
            {data.map((property) => (
              <TableRow key={property.propertyId}>
                <TableCell>
                  <PropertyThumb images={property.images} title={property.title} />
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  <Link
                    to={`/properties/${property.propertyId}`}
                    className="hover:text-blue-600 hover:underline"
                  >
                    {property.title}
                  </Link>
                </TableCell>
                <TableCell className="capitalize">{property.propertyType}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="map-pin" className="h-4 w-4 shrink-0 text-gray-400" />
                    {property.location}
                  </span>
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {formatPrice(property.price)}
                </TableCell>
                <TableCell>{property.bedrooms}</TableCell>
                <TableCell>
                  <Badge color={statusBadgeColor(property.status)}>{property.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge color={availabilityColor(property.availability)} dot={false}>
                    <span className="capitalize">{property.availability}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/properties/${property.propertyId}`}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Icon name="eye" className="h-3.5 w-3.5" />
                        View
                      </Link>
                      <Link
                        to={`/properties/${property.propertyId}/edit`}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        <Icon name="pencil" className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(property)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Icon name="trash" className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                    <WorkflowActions property={property} onChanged={reload} showStepper={false} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete property"
        message={deleteTarget ? `Delete "${deleteTarget.title}"? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}
