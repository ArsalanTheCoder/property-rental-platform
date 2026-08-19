import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

// INTEGRATION: inquiry contract PENDING (owner: Mohammad Arsalan, dependency
// #2). Read-only for now — the backend may later define status transitions, but
// no mutation actions are invented here (FR-028, FR-029). Fields shown by the
// UI come from the mock seed shape and are not permanent.
const realService = {
  list: () => http.get(endpoints.inquiries.list),
  get: (inquiryId) => http.get(endpoints.inquiries.get(inquiryId)),
}

const inquiryService = env.useMocks
  ? {
      list: () => mockApi.listInquiries(),
      get: (inquiryId) => mockApi.getInquiry(inquiryId),
    }
  : realService

export default inquiryService
