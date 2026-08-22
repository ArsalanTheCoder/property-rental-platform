import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

// Status transitions are authorized by the backend; the mock enforces the
// config-driven allowed transitions and surfaces rejections without
// fabricating success (FR-031, FR-032).
//
// Normalization: the backend returns populated documents
// (`userId` → { _id, name, email, ... }, `propertyId` → { _id, title, ... })
// inside the uniform envelope. The UI expects flat ids plus optional
// denormalized display fields, so this boundary flattens them.

function unwrap(envelope) {
  return envelope && typeof envelope === 'object' && 'data' in envelope ? envelope.data : envelope
}

function normalizeViewing(raw) {
  if (!raw || typeof raw !== 'object') {
    return raw
  }
  const user = typeof raw.userId === 'object' && raw.userId !== null ? raw.userId : null
  const property =
    typeof raw.propertyId === 'object' && raw.propertyId !== null ? raw.propertyId : null
  return {
    viewingId: raw._id ?? raw.id ?? raw.viewingId ?? '',
    userId: user?._id ?? raw.userId ?? '',
    userName: raw.userName || user?.name || '',
    // The ViewingRequest model has no phone field — surfaced as empty.
    userPhone: raw.userPhone ?? '',
    propertyId: property?._id ?? raw.propertyId ?? '',
    propertyTitle: property?.title,
    date: raw.date ?? '',
    time: raw.time ?? '',
    message: raw.message ?? '',
    adminNote: raw.adminNote ?? null,
    leadScore: raw.leadScore ?? null,
    status: raw.status ?? '',
    createdAt: raw.createdAt ?? '',
  }
}

const realService = {
  list: async () => {
    const data = unwrap(await http.get(endpoints.viewingRequests.list))
    return (data?.viewings ?? []).map(normalizeViewing)
  },

  get: async (viewingId) => {
    const data = unwrap(await http.get(endpoints.viewingRequests.get(viewingId)))
    return normalizeViewing(data?.viewing)
  },

  updateStatus: async (viewingId, status) => {
    const data = unwrap(
      await http.patch(endpoints.viewingRequests.updateStatus(viewingId), { status })
    )
    return normalizeViewing(data?.viewing)
  },

  // AI lead score — GET /admin/viewings/:id/lead-score
  // → { viewingId, leadScore: { score, reasoning, evaluatedAt } }
  getLeadScore: async (viewingId) => {
    const data = unwrap(await http.get(endpoints.viewingRequests.leadScore(viewingId)))
    return {
      viewingId: data?.viewingId ?? viewingId,
      leadScore: data?.leadScore ?? null,
    }
  },
}

const viewingRequestService = env.useMocks
  ? {
      list: () => mockApi.listViewingRequests(),
      get: (viewingId) => mockApi.getViewingRequest(viewingId),
      updateStatus: (viewingId, status) => mockApi.updateViewingRequestStatus(viewingId, status),
      getLeadScore: (viewingId) => mockApi.getLeadScore(viewingId),
    }
  : realService

export default viewingRequestService
