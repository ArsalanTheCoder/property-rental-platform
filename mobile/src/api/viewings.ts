import { PropertySummary, ViewingRequest, ViewingStatus } from "@/types";
import { apiRequest } from "./config";

interface BackendViewingListItem {
  _id: string;
  property: {
    _id: string;
    title: string;
    price: number;
    location: PropertySummary["location"];
    images: string[];
  };
  date: string;
  time: string;
  message?: string;
  status: ViewingStatus;
  adminNote?: string;
  createdAt: string;
}

interface BackendViewingCreated {
  _id: string;
  propertyId: string;
  userName: string;
  date: string;
  time: string;
  message?: string;
  status: ViewingStatus;
  createdAt: string;
}

function mapListItem(raw: BackendViewingListItem): ViewingRequest {
  return {
    id: raw._id,
    propertyId: raw.property._id,
    property: {
      id: raw.property._id,
      title: raw.property.title,
      price: raw.property.price,
      location: raw.property.location,
      images: raw.property.images,
    },
    date: raw.date,
    time: raw.time,
    message: raw.message,
    status: raw.status,
    adminNote: raw.adminNote,
    createdAt: raw.createdAt,
  };
}

export async function getMyViewingRequests(status?: ViewingStatus): Promise<ViewingRequest[]> {
  const query = status ? `?status=${status}` : "";
  const { viewings } = await apiRequest<{ viewings: BackendViewingListItem[] }>(
    `/viewings/my-requests${query}`
  );
  return viewings.map(mapListItem);
}

interface NewViewingRequest {
  date: string;
  time: string;
  message?: string;
}

export async function submitViewingRequest(
  propertyId: string,
  payload: NewViewingRequest
): Promise<ViewingRequest> {
  const { viewing } = await apiRequest<{ viewing: BackendViewingCreated }>(
    `/properties/${propertyId}/viewings`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  return {
    id: viewing._id,
    propertyId: viewing.propertyId,
    userName: viewing.userName,
    date: viewing.date,
    time: viewing.time,
    message: viewing.message,
    status: viewing.status,
    createdAt: viewing.createdAt,
  };
}

export async function cancelViewingRequest(viewingId: string): Promise<void> {
  await apiRequest(`/viewings/${viewingId}/cancel`, { method: "PATCH" });
}
