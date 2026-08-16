import { User, ViewingRequest } from "@/types";

export const mockUser: User = {
  userId: "u001",
  name: "Ayesha Khan",
  email: "ayesha.khan@example.com",
  phone: "0300-1234567",
  favorites: ["p001", "p005"],
};

// Demo viewing requests tied to the mock user above, used to preview
// the booking status screen without a backend.
export const mockViewingRequests: ViewingRequest[] = [
  {
    viewingId: "v001",
    userId: "u001",
    propertyId: "p001",
    userName: "Ayesha Khan",
    userPhone: "0300-1234567",
    date: "2026-08-18",
    time: "5:00 PM",
    message: "Would like to see the balcony view before deciding.",
    status: "Confirmed",
    createdAt: "2026-08-10T09:00:00Z",
  },
  {
    viewingId: "v002",
    userId: "u001",
    propertyId: "p003",
    userName: "Ayesha Khan",
    userPhone: "0300-1234567",
    date: "2026-08-20",
    time: "11:30 AM",
    status: "Pending",
    createdAt: "2026-08-12T14:20:00Z",
  },
  {
    viewingId: "v003",
    userId: "u001",
    propertyId: "p007",
    userName: "Ayesha Khan",
    userPhone: "0300-1234567",
    date: "2026-08-05T00:00:00Z".slice(0, 10),
    time: "3:00 PM",
    status: "Completed",
    createdAt: "2026-07-28T08:00:00Z",
  },
];
