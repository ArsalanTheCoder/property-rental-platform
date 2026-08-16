// Single place to point the app at the real backend.
//
// While Arsalan's backend is not deployed yet, USE_MOCK_DATA stays true
// and every function in this src/api folder returns local demo data
// instead of calling the network. Once the backend is live:
//   1. Set BASE_URL to the real API URL.
//   2. Paste the API key into API_KEY (or load it from an env variable).
//   3. Flip USE_MOCK_DATA to false.
// No other file needs to change - every screen already calls the
// functions in src/api, not fetch() directly.

export const BASE_URL = "https://api.example.com/v1";

export const API_KEY = "";

export const USE_MOCK_DATA = true;

// Small helper that adds the base URL, auth header and JSON parsing
// so individual API files stay short. Throws on non-2xx responses so
// callers can catch and show an error message.
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Request to ${path} failed with status ${response.status}. ${errorBody}`
    );
  }

  return response.json() as Promise<T>;
}

// Fake network delay so the demo UI shows its loading states, similar
// to how it will behave once real requests are wired in.
export const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));
