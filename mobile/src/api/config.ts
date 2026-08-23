import { Platform } from "react-native";

// Single place to point the app at the real backend.
// On Android Emulator: use 10.0.2.2 or your machine IP.
// On physical phone (Expo Go on Wi-Fi): use your machine Wi-Fi IP (192.168.100.6).
// On iOS Simulator / Web: use localhost.
const DEV_MACHINE_IP = "192.168.100.6";

export const BASE_URL =
  Platform.OS === "android"
    ? `http://${DEV_MACHINE_IP}:5000/api/v1`
    : `http://localhost:5000/api/v1`;

export interface ApiEnvelope<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  errors?: { field: string; message: string }[];
}

// Thrown on any non-2xx response. Carries the HTTP status so callers
// can branch on specific cases (401 vs 403 vs 429) without parsing
// the message string.
export class ApiRequestError extends Error {
  status: number;
  errors?: { field: string; message: string }[];

  constructor(status: number, message: string, errors?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// Wraps fetch with the base URL, JSON handling, and credentials so
// the accessToken/refreshToken cookies from RFC-001-B are always
// sent and stored. Every request in src/api goes through this
// instead of calling fetch directly.
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body: ApiEnvelope<T> | null = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    throw new ApiRequestError(
      response.status,
      body?.message ?? `Request to ${path} failed with status ${response.status}`,
      body?.errors
    );
  }

  return body.data;
}

// multipart/form-data requests (property image uploads) need the
// browser/native layer to set the Content-Type boundary itself, so
// this variant deliberately omits the JSON header.
export async function apiRequestFormData<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" = "POST"
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    body: formData,
  });

  const body: ApiEnvelope<T> | null = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    throw new ApiRequestError(
      response.status,
      body?.message ?? `Request to ${path} failed with status ${response.status}`,
      body?.errors
    );
  }

  return body.data;
}
