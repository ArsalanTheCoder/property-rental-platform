import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

const realService = {
  getSummary: () => http.get(endpoints.dashboard.summary),
}

const dashboardService = env.useMocks
  ? { getSummary: () => mockApi.getDashboardSummary() }
  : realService

export default dashboardService
