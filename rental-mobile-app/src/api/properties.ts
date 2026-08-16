import { Property, PropertyFilters } from "@/types";
import { mockProperties, getPropertyById as getMockPropertyById } from "@/data/mockProperties";
import { apiRequest, mockDelay, USE_MOCK_DATA } from "./config";

// Returns all published properties, optionally narrowed down by the
// filters selected on the search screen.
export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return filterMockProperties(filters);
  }

  const params = new URLSearchParams();
  if (filters?.location) params.append("location", filters.location);
  if (filters?.minPrice) params.append("minPrice", String(filters.minPrice));
  if (filters?.maxPrice) params.append("maxPrice", String(filters.maxPrice));
  if (filters?.propertyType) params.append("propertyType", filters.propertyType);
  if (filters?.bedrooms) params.append("bedrooms", String(filters.bedrooms));

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<Property[]>(`/properties${query}`);
}

export async function getPropertyDetails(propertyId: string): Promise<Property | undefined> {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return getMockPropertyById(propertyId);
  }

  return apiRequest<Property>(`/properties/${propertyId}`);
}

// Kept separate from getProperties so the search screen can filter
// client side against the mock list without touching the real logic
// that will eventually live on the backend.
function filterMockProperties(filters?: PropertyFilters): Property[] {
  if (!filters) return mockProperties;

  return mockProperties.filter((property) => {
    if (
      filters.location &&
      !`${property.location.city} ${property.location.area}`
        .toLowerCase()
        .includes(filters.location.toLowerCase())
    ) {
      return false;
    }
    if (filters.minPrice && property.price < filters.minPrice) return false;
    if (filters.maxPrice && property.price > filters.maxPrice) return false;
    if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
    if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false;
    return true;
  });
}
