import { apiRequest, mockDelay, USE_MOCK_DATA } from "./config";

interface NewInquiry {
  userId: string;
  propertyId: string;
  userName: string;
  userPhone: string;
  message: string;
}

export async function submitInquiry(payload: NewInquiry): Promise<void> {
  if (USE_MOCK_DATA) {
    await mockDelay(600);
    return;
  }

  await apiRequest("/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
