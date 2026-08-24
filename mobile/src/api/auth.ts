import { User } from "@/types";
import { apiRequest, ApiRequestError } from "./config";

// The backend returns "_id" on every document; this adapter is the
// one place that translates that into the "id" field the rest of
// the app uses. Nothing outside src/api should ever see "_id".
interface BackendUser {
  _id: string;
  name: string;
  email: string;
  role: User["role"];
  isEmailVerified: boolean;
  lastLoginAt?: string;
}

function mapUser(raw: BackendUser): User {
  return {
    id: raw._id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    isEmailVerified: raw.isEmailVerified,
    lastLoginAt: raw.lastLoginAt,
  };
}

// Every function here maps to exactly one endpoint from RFC-001-B.
// None of them return a token - the backend sets httpOnly cookies
// directly on the response, so there is nothing for the app to store.

export async function register(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<User> {
  const { user } = await apiRequest<{ user: BackendUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
  return mapUser(user);
}

export async function verifyEmail(token: string): Promise<void> {
  await apiRequest("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function resendVerification(email: string): Promise<void> {
  await apiRequest("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function login(email: string, password: string): Promise<User> {
  const { user } = await apiRequest<{ user: BackendUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return mapUser(user);
}

// Logout only needs the refresh cookie, never an access token, so it
// is safe to call even if the access token already expired.
export async function logout(): Promise<void> {
  await apiRequest("/auth/logout", { method: "POST" });
}

// Rotates the refresh/access cookie pair. Success just means new
// cookies were set - callers should retry their original request
// after this resolves.
export async function refreshToken(): Promise<void> {
  await apiRequest("/auth/refresh-token", { method: "POST" });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> {
  await apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword, confirmPassword }),
  });
}

// Used on app launch to restore the session from the accessToken
// cookie. Returns null instead of throwing when there is no valid
// session, so callers can treat "not logged in" as a normal case
// rather than an error.
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { user } = await apiRequest<{ user: BackendUser }>("/auth/me");
    return mapUser(user);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return null;
    }
    throw error;
  }
}
