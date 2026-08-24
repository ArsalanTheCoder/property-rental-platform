import { Property, PropertySummary } from "@/types";
import { apiRequest } from "./config";

interface BackendFavorite {
  _id: string;
  property: {
    _id: string;
    title: string;
    price: number;
    location: Property["location"];
    bedrooms: number;
    bathrooms: number;
    images: string[];
    availability: boolean;
  };
  createdAt: string;
}

function mapFavoriteProperty(raw: BackendFavorite["property"]): PropertySummary {
  return {
    id: raw._id,
    title: raw.title,
    price: raw.price,
    location: raw.location,
    bedrooms: raw.bedrooms,
    bathrooms: raw.bathrooms,
    images: raw.images,
    availability: raw.availability,
  };
}

// Returns the tenant's saved properties directly - the backend
// populates the property document on each favorite, so there is no
// need for a separate lookup.
export async function getFavorites(): Promise<PropertySummary[]> {
  const { favorites } = await apiRequest<{ favorites: BackendFavorite[] }>("/favorites");
  return (favorites || [])
    .filter((f) => f && f.property && f.property._id)
    .map((favorite) => mapFavoriteProperty(favorite.property));
}

export async function addFavorite(propertyId: string): Promise<void> {
  await apiRequest(`/favorites/${propertyId}`, { method: "POST" });
}

export async function removeFavorite(propertyId: string): Promise<void> {
  await apiRequest(`/favorites/${propertyId}`, { method: "DELETE" });
}
