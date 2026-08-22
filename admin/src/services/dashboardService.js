import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

// GET /admin/dashboard/stats returns grouped counters:
// { properties: { total, published, draft, unpublished, available, rented },
//   viewings:   { total, pending, confirmed, completed, rejected },
//   users:      { totalTenants, verifiedTenants, blockedTenants },
//   recentViewings: [...] }
// Normalized here into the flat summary the Dashboard UI already renders.
function normalizeStats(stats) {
  const properties = stats?.properties ?? {}
  const viewings = stats?.viewings ?? {}
  const users = stats?.users ?? {}
  return {
    totalProperties: properties.total ?? 0,
    publishedProperties: properties.published ?? 0,
    pendingProperties: Math.max(0, (properties.total ?? 0) - (properties.published ?? 0)),
    totalUsers: users.totalTenants ?? 0,
    // The backend has no inquiry concept yet (AGENTS.md §20) — no real source
    // exists for this card until an inquiry contract lands.
    pendingInquiries: 0,
    pendingViewingRequests: viewings.pending ?? 0,
  }
}

const realService = {
  getSummary: async () => {
    const envelope = await http.get(endpoints.dashboard.summary)
    return normalizeStats(envelope?.data)
  },
}

const dashboardService = env.useMocks
  ? { getSummary: () => mockApi.getDashboardSummary() }
  : realService

export default dashboardService
