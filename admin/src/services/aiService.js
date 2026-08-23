import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

// POST /admin/ai/generate-description
// Request  (backend ai.validator.js): { propertyType, city, bedrooms,
//   bathrooms, price, amenities?, furnished?, rawNotes? }
// Response (backend ai.service.js):   { title, description }
// The UI boundary keeps its conceptual `location`/`notes` fields; they are
// translated here so components stay untouched.

const AI_TIMEOUT_MS = 60000

function toBackendRequest(payload = {}) {
  const body = {
    propertyType: payload.propertyType,
    city: payload.city ?? payload.location ?? '',
    bedrooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    price: payload.price,
  }
  if (payload.amenities !== undefined) body.amenities = payload.amenities
  if (payload.furnished !== undefined) body.furnished = Boolean(payload.furnished)
  if (payload.rawNotes !== undefined || payload.notes !== undefined) {
    body.rawNotes = payload.rawNotes ?? payload.notes
  }
  return body
}

const realService = {
  generatePropertyContent: async (payload) => {
    const envelope = await http.post(endpoints.ai.generateDescription, toBackendRequest(payload), {
      timeout: AI_TIMEOUT_MS,
    })
    return { title: envelope?.data?.title ?? '', description: envelope?.data?.description ?? '' }
  },
}

const aiService = env.useMocks
  ? { generatePropertyContent: (payload) => mockApi.generatePropertyContent(payload) }
  : realService

export default aiService
