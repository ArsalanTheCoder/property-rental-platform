import { ViewingRequest } from "@/types";
import { mockViewingRequests } from "@/data/mockUser";
import { apiRequest, mockDelay, USE_MOCK_DATA } from "./config";

export async function getViewingRequests(userId: string): Promise<ViewingRequest[]> {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    return mockViewingRequests.filter((request) => request.userId === userId);
  }

  return apiRequest<ViewingRequest[]>(`/viewing-requests?userId=${userId}`);
}

interface NewViewingRequest {
  userId: string;
  propertyId: string;
  userName: string;
  userPhone: string;
  date: string;
  time: string;
  message?: string;
}

export async function submitViewingRequest(payload: NewViewingRequest): Promise<ViewingRequest> {
  if (USE_MOCK_DATA) {
    await mockDelay(600);
    return {
      viewingId: `v-demo-${Date.now()}`,
      status: "Pending",
      createdAt: new Date().toISOString(),
      ...payload,
    };
  }

  return apiRequest<ViewingRequest>("/viewing-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
