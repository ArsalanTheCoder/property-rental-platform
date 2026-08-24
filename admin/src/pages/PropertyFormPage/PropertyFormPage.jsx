import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import propertyService from '../../services/propertyService.js'
import { useAsyncData } from '../../hooks/useAsyncData.js'
import { useForm } from '../../hooks/useForm.js'
import { validators } from '../../utils/validators.js'
import { propertyWorkflow } from '../../config/propertyWorkflow.js'
import { useToast } from '../../context/ToastContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input, Select, Textarea } from '../../components/ui/Field.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { AiContentGenerator } from '../../components/properties/AiContentGenerator.jsx'
import ImagePicker, { isBlobUrl } from '../../components/properties/ImagePicker.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'

function splitList(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function urlList(value) {
  if (value == null || String(value).trim() === '') return null
  const urls = splitList(value)
  for (const url of urls) {
    try {
      new URL(url)
    } catch {
      return 'Enter valid image URLs separated by commas.'
    }
  }
  return null
}

const fieldValidators = {
  title: [validators.required, validators.minLength(3)],
  description: [validators.required, validators.minLength(20)],
  propertyType: validators.required,
  price: [validators.required, validators.numeric],
  location: validators.required,
  bedrooms: [validators.required, validators.integer],
  bathrooms: [validators.required, validators.integer],
  availability: validators.required,
  status: validators.required,
}

function createInitialValues() {
  return {
    title: '',
    description: '',
    propertyType: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '',
    furnished: false,
    existingImages: [],
    availability: '',
    status: propertyWorkflow.initialStatus,
  }
}

function toFormValues(property) {
  return {
    title: property.title ?? '',
    description: property.description ?? '',
    propertyType: property.propertyType ?? '',
    price: property.price != null ? String(property.price) : '',
    location: property.location ?? '',
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : '',
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : '',
    amenities: property.amenities?.join(', ') ?? '',
    furnished: Boolean(property.furnished),
    existingImages: property.images ?? [],
    availability: property.availability ?? '',
    status: property.status ?? '',
  }
}

function SectionHeader({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  )
}

export default function PropertyFormPage() {
  const { propertyId } = useParams()
  const isEdit = Boolean(propertyId)
  const { data, loading, error, reload } = useAsyncData(
    () => (isEdit ? propertyService.get(propertyId) : Promise.resolve(null)),
    [propertyId, isEdit]
  )

  if (isEdit && loading) {
    return <LoadingState message="Loading property…" />
  }

  if (isEdit && error) {
    return <ErrorState title="Unable to load property" message={error?.message} onRetry={reload} />
  }

  return (
    <PropertyForm
      key={isEdit ? propertyId : 'new'}
      isEdit={isEdit}
      propertyId={propertyId}
      initialValues={isEdit ? toFormValues(data) : createInitialValues()}
    />
  )
}

function PropertyForm({ isEdit, propertyId, initialValues }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [existingImages, setExistingImages] = useState(initialValues.existingImages ?? [])
  const [newFiles, setNewFiles] = useState([])
  const { values, errors, setValue, onBlur, validateForm } = useForm(initialValues, fieldValidators)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validateForm() || submitting) return
    setSubmitting(true)
    setFormError(null)

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      propertyType: values.propertyType,
      price: Number(values.price),
      location: values.location.trim(),
      bedrooms: Number(values.bedrooms),
      bathrooms: Number(values.bathrooms),
      amenities: splitList(values.amenities),
      furnished: Boolean(values.furnished),
      images: existingImages,
      availability: values.availability,
      status: values.status,
    }

    try {
      let targetId = propertyId
      if (isEdit) {
        await propertyService.update(propertyId, payload)
      } else {
        const created = await propertyService.create(payload)
        targetId = created.propertyId
      }

      // Upload newly selected image files directly to Cloudinary
      if (newFiles.length > 0) {
        await propertyService.uploadImages(targetId, newFiles)
      }

      toast.success(isEdit ? 'Property updated successfully.' : 'Property created successfully.')
      navigate(`/properties/${targetId}`, { replace: true })
    } catch (err) {
      setFormError(err?.message ?? 'Unable to save the property.')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={isEdit ? `/properties/${propertyId}` : '/properties'}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        Back to {isEdit ? 'property details' : 'properties'}
      </Link>
      <h1 className="mt-3 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        {isEdit ? 'Edit property' : 'Add property'}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
        {formError && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <Icon name="alert" className="h-5 w-5 shrink-0" />
            {formError}
          </div>
        )}

        <Card>
          <SectionHeader
            icon="document-text"
            title="Basic information"
            description="The title and description tenants see first."
          />
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                id="title"
                label="Title"
                required
                value={values.title}
                onChange={(e) => setValue('title', e.target.value)}
                onBlur={() => onBlur('title')}
                error={errors.title}
                placeholder="e.g. Sunny 2-Bedroom Apartment Downtown"
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                id="description"
                label="Description"
                required
                rows={4}
                value={values.description}
                onChange={(e) => setValue('description', e.target.value)}
                onBlur={() => onBlur('description')}
                error={errors.description}
                placeholder="Describe the property (at least 20 characters)."
              />
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader
            icon="building"
            title="Property details"
            description="Type, location, pricing, and layout information."
          />
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <div>
              <Select
                id="propertyType"
                label="Property type"
                required
                value={values.propertyType}
                onChange={(e) => setValue('propertyType', e.target.value)}
                onBlur={() => onBlur('propertyType')}
                error={errors.propertyType}
              >
                <option value="">Select a type</option>
                {propertyWorkflow.propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Input
                id="location"
                label="Location"
                required
                value={values.location}
                onChange={(e) => setValue('location', e.target.value)}
                onBlur={() => onBlur('location')}
                error={errors.location}
              />
            </div>
            <div>
              <Input
                id="price"
                label="Price (per month)"
                required
                type="number"
                min="0"
                value={values.price}
                onChange={(e) => setValue('price', e.target.value)}
                onBlur={() => onBlur('price')}
                error={errors.price}
              />
            </div>
            <div>
              <Input
                id="bedrooms"
                label="Bedrooms"
                required
                type="number"
                min="0"
                step="1"
                value={values.bedrooms}
                onChange={(e) => setValue('bedrooms', e.target.value)}
                onBlur={() => onBlur('bedrooms')}
                error={errors.bedrooms}
              />
            </div>
            <div>
              <Input
                id="bathrooms"
                label="Bathrooms"
                required
                type="number"
                min="0"
                step="1"
                value={values.bathrooms}
                onChange={(e) => setValue('bathrooms', e.target.value)}
                onBlur={() => onBlur('bathrooms')}
                error={errors.bathrooms}
              />
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={values.furnished}
                  onChange={(e) => setValue('furnished', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Furnished
              </label>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader
            icon="check"
            title="Amenities"
            description="Features available in the property, e.g. wifi, parking, balcony."
          />
          <div className="p-5">
            <Input
              id="amenities"
              label="Amenities"
              value={values.amenities}
              onChange={(e) => setValue('amenities', e.target.value)}
              hint="Comma-separated list, e.g. wifi, parking, balcony"
            />
          </div>
        </Card>

        <Card>
          <SectionHeader
            icon="photo"
            title="Images"
            description="Select property photos to upload to Cloudinary CDN."
          />
          <div className="p-5">
            <ImagePicker
              existingImages={existingImages}
              onExistingImagesChange={setExistingImages}
              newFiles={newFiles}
              onNewFilesChange={setNewFiles}
            />
          </div>
        </Card>

        <AiContentGenerator
          values={values}
          onApply={({ title, description }) => {
            setValue('title', title)
            setValue('description', description)
          }}
        />

        <Card>
          <SectionHeader
            icon="shield-check"
            title="Listing state"
            description="Availability and publication status for this listing."
          />
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <div>
              <Select
                id="availability"
                label="Availability"
                required
                value={values.availability}
                onChange={(e) => setValue('availability', e.target.value)}
                onBlur={() => onBlur('availability')}
                error={errors.availability}
              >
                <option value="">Select availability</option>
                {propertyWorkflow.availability.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Select
                id="status"
                label="Status"
                required
                value={values.status}
                onChange={(e) => setValue('status', e.target.value)}
                onBlur={() => onBlur('status')}
                 error={errors.status}
                 hint="Usual status changes happen via the Publish / Unpublish workflow on the details page."
              >
                {propertyWorkflow.statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap gap-3 pb-2">
          <Button type="submit" loading={submitting} disabled={submitting} size="lg">
            {isEdit ? 'Save changes' : 'Create property'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate(isEdit ? `/properties/${propertyId}` : '/properties')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
