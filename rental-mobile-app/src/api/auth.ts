import { User } from "@/types";
import { mockUser } from "@/data/mockUser";
import { apiRequest, mockDelay, USE_MOCK_DATA } from "./config";

interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK_DATA) {
    await mockDelay(600);
    // Demo mode accepts any password so reviewers can log in without
    // needing real credentials. Remove this once the backend is live.
    return { user: mockUser, token: "demo-token" };
  }

  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(name: string, email: string, phone: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK_DATA) {
    await mockDelay(600);
    return {
      user: { ...mockUser, name, email, phone, favorites: [] },
      token: "demo-token",
    };
  }

  return apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, phone, password }),
  });
}
