import { mockApi } from '../mocks/mockApi.js'

// INTEGRATION DECISION (see backend/src/routes/admin.routes.js): the backend
// exposes NO admin inquiry endpoint, and per AGENTS.md §20 the platform has no
// general-inquiry record — the saved tenant request is the viewing request.
// Until a real contract exists, inquiries remain a read-only, mock-backed
// feature in every mode. There is deliberately no real-API branch here so the
// UI can never call an invented route.

const inquiryService = {
  list: () => mockApi.listInquiries(),
  get: (inquiryId) => mockApi.getInquiry(inquiryId),
}

export default inquiryService
