import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

// INTEGRATION: viewing request contract PENDING (owner: Mohammad Arsalan,
// dependency #2). Status transitions are authorized by the backend; the mock
// enforces the config-driven allowed transitions and surfaces rejections
// without fabricating success (FR-031, FR-032).
const realService = {
  list: () => http.get(endpoints.viewingRequests.list),
  get: (viewingId) => http.get(endpoints.viewingRequests.get(viewingId)),
  updateStatus: (viewingId, status) =>
    http.put(endpoints.viewingRequests.updateStatus(viewingId), { status }),
}

const viewingRequestService = env.useMocks
  ? {
      list: () => mockApi.listViewingRequests(),
      get: (viewingId) => mockApi.getViewingRequest(viewingId),
      updateStatus: (viewingId, status) => mockApi.updateViewingRequestStatus(viewingId, status),
    }
  : realService

export default viewingRequestService
