// These types match the real backend contracts from RFC-001-B
// (auth), RFC-002-B (admin/property schema), and RFC-003-B
// (tenant-facing endpoints). Backend documents use "_id"; the API
// layer in src/api maps that to "id" before handing data to the UI,
// so nothing outside src/api should ever see "_id".

export type UserRole = "TENANT" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  lastLoginAt?: string;
}

export type PropertyType =
  | "Apartment"
  | "House"
  | "Villa"
  | "Studio"
  | "Commercial"
  | "Penthouse";

export interface PropertyLocation {
  address: string;
  city: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  price: number;
  location: PropertyLocation;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  furnished: boolean;
  images: string[];
  availability: boolean;
  isFavorited?: boolean;
  createdAt: string;
}

// A lighter shape returned when a property is nested inside a
// favorite or a viewing request - the backend does not populate
// every field in those cases.
export type PropertySummary = Pick<
  Property,
  "id" | "title" | "price" | "location" | "images"
> &
  Partial<Pick<Property, "bedrooms" | "bathrooms" | "propertyType" | "availability">>;

export interface Pagination {
  currentPage: number;
  totalPages: number;
  limit: number;
}

// Lowercase to match the backend's stored values exactly. Display
// labels are capitalized in the UI layer (see StatusPill).
export type ViewingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

export interface ViewingRequest {
  id: string;
  propertyId: string;
  property?: PropertySummary;
  userName?: string;
  date: string;
  time: string;
  message?: string;
  status: ViewingStatus;
  adminNote?: string;
  createdAt: string;
}

// Filters used on the search screen, matching the real query
// parameters accepted by GET /api/v1/properties.
export interface PropertyFilters {
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "bedrooms_desc";
}

// Property-specific AI chatbot. Answers are not persisted by the
// backend, so this only needs to exist client side for the duration
// of the screen.
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}
