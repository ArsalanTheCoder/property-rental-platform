import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

const realService = {
  // INTEGRATION: AI endpoint/schema PENDING (owner: Sanaullah, dependency #7).
  // The Admin Panel depends only on this boundary; the wire shape is not
  // invented here (FR-026, FR-043).
  generatePropertyContent: (payload) => http.post(endpoints.ai.generatePropertyContent, payload),
}

const aiService = env.useMocks
  ? { generatePropertyContent: (payload) => mockApi.generatePropertyContent(payload) }
  : realService

export default aiService
