// These types mirror the shared data model from the project spec.
// Backend, web, admin panel and this app all need to agree on these
// shapes, so avoid renaming fields here without checking with the
// backend dev first.

export type PropertyType = "Apartment" | "House" | "Studio" | "Villa" | "Room";

export type PropertyStatus = "Published" | "Draft" | "Pending";

export interface Property {
  propertyId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  price: number;
  location: {
    city: string;
    area: string;
    address?: string;
  };
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  furnished: boolean;
  images: string[];
  availability: boolean;
  status: PropertyStatus;
  createdAt: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  phone: string;
  favorites: string[];
}

export interface Favorite {
  favoriteId: string;
  userId: string;
  propertyId: string;
}

export type ViewingStatus =
  | "Pending"
  | "Confirmed"
  | "Rejected"
  | "Cancelled"
  | "Completed";

export interface ViewingRequest {
  viewingId: string;
  userId: string;
  propertyId: string;
  userName: string;
  userPhone: string;
  date: string;
  time: string;
  message?: string;
  status: ViewingStatus;
  createdAt: string;
}

export interface Inquiry {
  inquiryId: string;
  userId: string;
  propertyId: string;
  userName: string;
  userPhone: string;
  message: string;
  createdAt: string;
}

// Filters used on the search screen. Kept as a flat object so it can
// be serialized directly into query params once the real API is wired up.
export interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  bedrooms?: number;
}
