import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

// ─────────────────────────────────────────────────────────────────────────────
// Backend ↔ UI normalization layer (TASK 10)
//
// The backend property document (backend/src/models/Property.js) differs from
// the shape the admin UI renders:
//   - id is `_id`            → exposed as `propertyId`
//   - location is { address, city } → flattened to "address, city"
//   - availability is a boolean     → 'available' | 'rented'
// Responses use the uniform envelope { statusCode, success, message, data }.
// The UI components are untouched; only this boundary adapts.
// ─────────────────────────────────────────────────────────────────────────────

function unwrap(envelope) {
  return envelope && typeof envelope === 'object' && 'data' in envelope ? envelope.data : envelope
}

function splitLocation(location) {
  if (location && typeof location === 'object') {
    return {
      address: String(location.address ?? '').trim(),
      city: String(location.city ?? '').trim(),
    }
  }
  const text = String(location ?? '').trim()
  const parts = text.split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length >= 2) {
    return { address: parts.slice(0, -1).join(', '), city: parts[parts.length - 1] }
  }
  // Single-token locations cannot be split; reuse the value for both required
  // fields so the backend's address+city validation stays satisfiable.
  return { address: text, city: text }
}

function formatLocation(location) {
  if (!location) return ''
  if (typeof location === 'string') return location
  const { address, city } = location
  return [address, city].filter(Boolean).join(', ')
}

function normalizeProperty(raw) {
  if (!raw || typeof raw !== 'object') {
    return raw
  }
  return {
    propertyId: raw._id ?? raw.id ?? raw.propertyId ?? '',
    title: raw.title ?? '',
    description: raw.description ?? '',
    propertyType: raw.propertyType ?? '',
    price: raw.price ?? 0,
    location: formatLocation(raw.location),
    bedrooms: raw.bedrooms ?? 0,
    bathrooms: raw.bathrooms ?? 1,
    amenities: raw.amenities ?? [],
    furnished: Boolean(raw.furnished),
    images: raw.images ?? [],
    // Server-side boolean → the two states the UI can represent. Blob: URLs
    // are session-only previews and never sent to the backend.
    availability: raw.availability === false ? 'rented' : 'available',
    status: raw.status ?? '',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

function toBackendPayload(data = {}) {
  const payload = {}
  if (data.title !== undefined) payload.title = data.title
  if (data.description !== undefined) payload.description = data.description
  if (data.propertyType !== undefined) payload.propertyType = data.propertyType
  if (data.price !== undefined) payload.price = Number(data.price)
  if (data.location !== undefined) payload.location = splitLocation(data.location)
  if (data.bedrooms !== undefined) payload.bedrooms = Number(data.bedrooms)
  if (data.bathrooms !== undefined) payload.bathrooms = Number(data.bathrooms)
  if (data.amenities !== undefined) payload.amenities = data.amenities
  if (data.furnished !== undefined) payload.furnished = Boolean(data.furnished)
  if (data.availability !== undefined) payload.availability = data.availability === 'available'
  if (data.images !== undefined) {
    payload.images = (Array.isArray(data.images) ? data.images : []).filter(
      (url) => typeof url === 'string' && !url.startsWith('blob:')
    )
  }
  if (data.status !== undefined) payload.status = data.status
  return payload
}

function stripUnsupportedFilters(params = {}) {
  // Mirrors getAdminProperties() query params in backend property.service.js.
  // 'all' sentinels and unsupported filters (availability has no server-side
  // support yet) are dropped instead of being forwarded.
  const query = {}
  if (params.search) query.search = params.search
  if (params.status && params.status !== 'all') query.status = params.status
  if (params.propertyType && params.propertyType !== 'all') query.propertyType = params.propertyType
  return query
}

const realService = {
  list: async (params) => {
    const data = unwrap(await http.get(endpoints.properties.list, {
      params: stripUnsupportedFilters(params),
    }))
    return (data?.properties ?? []).map(normalizeProperty)
  },

  get: async (propertyId) => {
    const data = unwrap(await http.get(endpoints.properties.get(propertyId)))
    return normalizeProperty(data?.property)
  },

  create: async (payload) => {
    const data = unwrap(await http.post(endpoints.properties.create, toBackendPayload(payload)))
    return normalizeProperty(data?.property)
  },

  update: async (propertyId, payload) => {
    const data = unwrap(
      await http.patch(endpoints.properties.update(propertyId), toBackendPayload(payload))
    )
    return normalizeProperty(data?.property)
  },

  remove: async (propertyId) => {
    await http.delete(endpoints.properties.remove(propertyId))
    return undefined
  },

  // Real backend route for every status transition (publish/unpublish, etc.).
  updateStatus: async (propertyId, status) => {
    const data = unwrap(
      await http.patch(endpoints.properties.updateStatus(propertyId), { status })
    )
    return { propertyId: data?.propertyId ?? propertyId, status: data?.status ?? status }
  },

  // Multipart upload — field name MUST stay `images` (backend upload.middleware.js:
  // multer upload.array("images", 10)). Content-Type is intentionally NOT set so
  // the browser generates the multipart boundary.
  uploadImages: async (propertyId, files) => {
    const formData = new FormData()
    for (const file of files ?? []) {
      formData.append('images', file)
    }
    const data = unwrap(await http.post(endpoints.properties.uploadImages(propertyId), formData))
    return {
      propertyId: data?.propertyId ?? propertyId,
      images: data?.images ?? [],
      newlyUploaded: data?.newlyUploaded ?? [],
    }
  },

  deleteImage: async (propertyId, imageUrl) => {
    const data = unwrap(
      await http.delete(endpoints.properties.deleteImage(propertyId), { data: { imageUrl } })
    )
    return { propertyId: data?.propertyId ?? propertyId, images: data?.images ?? [] }
  },
}

const propertyService = env.useMocks
  ? {
      list: (params) => mockApi.listProperties(params),
      get: (propertyId) => mockApi.getProperty(propertyId),
      create: (data) => mockApi.createProperty(data),
      update: (propertyId, data) => mockApi.updateProperty(propertyId, data),
      remove: (propertyId) => mockApi.removeProperty(propertyId),
      updateStatus: (propertyId, status) => mockApi.updatePropertyStatus(propertyId, status),
    }
  : realService

export default propertyService
