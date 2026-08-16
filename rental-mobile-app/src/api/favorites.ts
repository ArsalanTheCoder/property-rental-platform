import { apiRequest, mockDelay, USE_MOCK_DATA } from "./config";

// In mock mode favorites are kept in memory by FavoritesContext, so
// these two calls just simulate the network round trip. Once the
// backend is live they will actually persist the change.
export async function addFavorite(userId: string, propertyId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await mockDelay(250);
    return;
  }

  await apiRequest("/favorites", {
    method: "POST",
    body: JSON.stringify({ userId, propertyId }),
  });
}

export async function removeFavorite(userId: string, propertyId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await mockDelay(250);
    return;
  }

  await apiRequest(`/favorites/${propertyId}`, {
    method: "DELETE",
  });
}
