export const env = {
  // Backend default: PORT=5000, routes mounted under /api/v1 (backend/src/app.js).
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
}
