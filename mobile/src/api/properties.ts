import { Pagination, Property, PropertyFilters } from "@/types";
import { apiRequest } from "./config";

interface BackendProperty {
  _id: string;
  title: string;
  description: string;
  propertyType: Property["propertyType"];
  price: number;
  location: Property["location"];
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  furnished: boolean;
  images: string[];
  availability: boolean;
  isFavorited?: boolean;
  createdAt: string;
}

function mapProperty(raw: BackendProperty): Property {
  return {
    id: raw._id,
    title: raw.title,
    description: raw.description,
    propertyType: raw.propertyType,
    price: raw.price,
    location: raw.location,
    bedrooms: raw.bedrooms,
    bathrooms: raw.bathrooms,
    amenities: raw.amenities,
    furnished: raw.furnished,
    images: raw.images,
    availability: raw.availability,
    isFavorited: raw.isFavorited,
    createdAt: raw.createdAt,
  };
}

function buildQuery(filters?: PropertyFilters, page?: number, limit?: number): string {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.city) params.append("city", filters.city);
  if (filters?.propertyType) params.append("propertyType", filters.propertyType);
  if (filters?.minPrice) params.append("minPrice", String(filters.minPrice));
  if (filters?.maxPrice) params.append("maxPrice", String(filters.maxPrice));
  if (filters?.bedrooms) params.append("bedrooms", String(filters.bedrooms));
  if (filters?.bathrooms) params.append("bathrooms", String(filters.bathrooms));
  if (filters?.furnished !== undefined) params.append("furnished", String(filters.furnished));
  if (filters?.sort) params.append("sort", filters.sort);
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getProperties(
  filters?: PropertyFilters,
  page = 1,
  limit = 20
): Promise<{ properties: Property[]; pagination: Pagination }> {
  const query = buildQuery(filters, page, limit);
  const { properties, pagination } = await apiRequest<{
    properties: BackendProperty[];
    pagination: Pagination;
  }>(`/properties${query}`);

  return { properties: properties.map(mapProperty), pagination };
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const { properties } = await apiRequest<{ properties: BackendProperty[] }>("/properties/featured");
  return properties.map(mapProperty);
}

export async function getPropertyDetails(propertyId: string): Promise<Property> {
  const { property } = await apiRequest<{ property: BackendProperty }>(`/properties/${propertyId}`);
  return mapProperty(property);
}
