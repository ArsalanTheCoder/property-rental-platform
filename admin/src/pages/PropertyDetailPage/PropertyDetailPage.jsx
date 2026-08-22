import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import propertyService from '../../services/propertyService.js'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { propertyWorkflow } from '../../config/propertyWorkflow.js'
import { formatPrice } from '../../utils/format.js'
import { statusBadgeColor } from '../../utils/status.js'
import { useToast } from '../../context/ToastContext.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { AiContentGenerator } from '../../components/properties/AiContentGenerator.jsx'
import { WorkflowActions } from '../../components/properties/WorkflowActions.jsx'

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

function CardHeader({ icon, title, extra, children }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <Icon name={icon} className="h-5 w-5 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="flex items-center gap-2">{extra}{children}</div>
    </div>
  )
}

export default function PropertyDetailPage() {
  const { propertyId } = useParams()
  const toast = useToast()
  const navigate = useNavigate()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [savingContent, setSavingContent] = useState(false)
  const { data: property, loading, error, reload } = useAsyncData(
    () => propertyService.get(propertyId),
    [propertyId]
  )

  async function confirmDelete() {
    setDeleting(true)
    try {
      await propertyService.remove(propertyId)
      toast.success('Property deleted successfully.')
      navigate('/properties', { replace: true })
    } catch (err) {
      toast.error(err?.message ?? 'Unable to delete the property.')
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  async function applyGeneratedContent({ title, description }) {
    setSavingContent(true)
    try {
      await propertyService.update(propertyId, { title, description })
      toast.success('Generated content saved to the property.')
      reload()
    } catch (err) {
      toast.error(err?.message ?? 'Unable to save the generated content.')
    } finally {
      setSavingContent(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading property…" />
  }

  if (error) {
    return <ErrorState title="Unable to load property" message={error?.message} onRetry={reload} />
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/properties"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        Back to properties
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            {property.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge color={statusBadgeColor(property.status)}>{property.status}</Badge>
            <Badge color="blue" dot={false}>
              <span className="capitalize">{property.availability}</span>
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/properties/${propertyId}/edit`)}>
            <Icon name="pencil" className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            <Icon name="trash" className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader icon="photo" title="Images" />
          {property.images?.length ? (
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
              {property.images.map((src, index) => (
                <img
                  key={`${src}-${index}`}
                  src={src}
                  alt={`${property.title} image ${index + 1}`}
                  className="h-44 w-full rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Icon name="photo" className="h-6 w-6" />
              </div>
              <p className="text-sm text-gray-500">No images for this property yet.</p>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader icon="document-text" title="Description" />
          <p className="p-5 text-sm leading-relaxed text-gray-700">
            {property.description || 'No description provided.'}
          </p>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader icon="building" title="Details" />
        <dl className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow icon="key" label="Property ID" value={property.propertyId} />
          <DetailRow icon="home" label="Type" value={property.propertyType} />
          <DetailRow icon="clock" label="Price" value={formatPrice(property.price)} />
          <DetailRow icon="map-pin" label="Location" value={property.location} />
          <DetailRow icon="home" label="Bedrooms" value={property.bedrooms} />
          <DetailRow icon="home" label="Bathrooms" value={property.bathrooms} />
          <DetailRow icon="check" label="Furnished" value={property.furnished ? 'Yes' : 'No'} />
          <DetailRow icon="calendar" label="Availability" value={property.availability} />
          <DetailRow icon="shield-check" label="Status" value={property.status} />
        </dl>
        <div className="border-t border-gray-100 px-5 py-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Amenities</dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {property.amenities?.length ? (
              property.amenities.map((amenity) => (
                <Badge key={amenity} color="gray" dot={false}>
                  {amenity}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">None</span>
            )}
          </dd>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader
          icon="shield-check"
          title="Workflow"
          extra={
            <span className="text-xs text-gray-500">
              {propertyWorkflow.actions.map((action) => action.action).join(' / ')}
            </span>
          }
        />
        <div className="p-5">
          <WorkflowActions property={property} onChanged={reload} />
        </div>
      </Card>

      <AiContentGenerator
        values={property}
        saveLabel="Save to property"
        saving={savingContent}
        onApply={applyGeneratedContent}
      />

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete property"
        message={`Delete "${property.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}
