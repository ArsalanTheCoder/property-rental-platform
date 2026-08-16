import { Property } from "@/types";

// Demo data only. Once the backend is ready, src/api/properties.ts
// should fetch this same shape from the real endpoint and this file
// can be deleted.
export const mockProperties: Property[] = [
  {
    propertyId: "p001",
    title: "Sunlit 2 Bed Apartment in Clifton",
    description:
      "A bright, well-maintained apartment on the fourth floor with a sea-facing balcony. Close to schools, restaurants and the beach. Recently renovated kitchen with fitted cabinets.",
    propertyType: "Apartment",
    price: 85000,
    location: { city: "Karachi", area: "Clifton Block 5", address: "Khayaban-e-Roomi" },
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["Parking", "Elevator", "Backup Generator", "Security"],
    furnished: true,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
    ],
    availability: true,
    status: "Published",
    createdAt: "2026-07-02T10:00:00Z",
  },
  {
    propertyId: "p002",
    title: "Modern Studio Near NIPA Chowrangi",
    description:
      "Compact studio ideal for a single professional or student. Fully furnished with a small kitchenette, fast internet wiring already installed and a dedicated parking spot.",
    propertyType: "Studio",
    price: 38000,
    location: { city: "Karachi", area: "Gulshan-e-Iqbal" },
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Parking", "Internet Ready", "Security"],
    furnished: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200",
    ],
    availability: true,
    status: "Published",
    createdAt: "2026-07-05T10:00:00Z",
  },
  {
    propertyId: "p003",
    title: "Spacious 4 Bed House in DHA Phase 6",
    description:
      "Independent house with a private lawn, servant quarters and a covered driveway that fits two cars. Quiet street, walking distance from DHA park.",
    propertyType: "House",
    price: 250000,
    location: { city: "Karachi", area: "DHA Phase 6" },
    bedrooms: 4,
    bathrooms: 4,
    amenities: ["Parking", "Lawn", "Servant Quarter", "Backup Generator"],
    furnished: false,
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
    ],
    availability: true,
    status: "Published",
    createdAt: "2026-06-28T10:00:00Z",
  },
  {
    propertyId: "p004",
    title: "Cozy Single Room in Gulistan-e-Johar",
    description:
      "A single furnished room within a shared apartment. Utilities included in rent. Good option for a student close to universities in Johar.",
    propertyType: "Room",
    price: 22000,
    location: { city: "Karachi", area: "Gulistan-e-Johar" },
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Utilities Included", "Internet Ready"],
    furnished: true,
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200",
    ],
    availability: true,
    status: "Published",
    createdAt: "2026-07-09T10:00:00Z",
  },
  {
    propertyId: "p005",
    title: "Elegant Villa with Private Pool, Bahria Town",
    description:
      "A premium villa with a private swimming pool, landscaped garden and a home theatre room. Situated in a gated community with round the clock security.",
    propertyType: "Villa",
    price: 480000,
    location: { city: "Lahore", area: "Bahria Town" },
    bedrooms: 5,
    bathrooms: 5,
    amenities: ["Private Pool", "Parking", "Security", "Garden", "Home Theatre"],
    furnished: true,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
    ],
    availability: true,
    status: "Published",
    createdAt: "2026-06-20T10:00:00Z",
  },
  {
    propertyId: "p006",
    title: "3 Bed Apartment Overlooking Margalla Hills",
    description:
      "A well-lit apartment with unobstructed hill views from the living room. Located in a quiet sector with easy access to markets and schools.",
    propertyType: "Apartment",
    price: 110000,
    location: { city: "Islamabad", area: "F-11" },
    bedrooms: 3,
    bathrooms: 3,
    amenities: ["Parking", "Elevator", "Backup Generator"],
    furnished: false,
    images: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
    ],
    availability: false,
    status: "Published",
    createdAt: "2026-07-01T10:00:00Z",
  },
  {
    propertyId: "p007",
    title: "Affordable Studio in Johar Town",
    description:
      "Newly built studio unit in a mid-rise building. Great for a small family starting out. Close to public transport and a nearby grocery market.",
    propertyType: "Studio",
    price: 45000,
    location: { city: "Lahore", area: "Johar Town" },
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Parking", "Security"],
    furnished: false,
    images: [
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=1200",
    ],
    availability: true,
    status: "Published",
    createdAt: "2026-07-11T10:00:00Z",
  },
  {
    propertyId: "p008",
    title: "3 Bed House Near Askari Park",
    description:
      "Family house with a small front lawn and a separate lounge. Recently painted, ready to move in. Peaceful residential block.",
    propertyType: "House",
    price: 165000,
    location: { city: "Karachi", area: "Askari 5" },
    bedrooms: 3,
    bathrooms: 3,
    amenities: ["Parking", "Lawn", "Security"],
    furnished: false,
    images: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200",
    ],
    availability: true,
    status: "Published",
    createdAt: "2026-06-30T10:00:00Z",
  },
];

export const getPropertyById = (id: string): Property | undefined =>
  mockProperties.find((property) => property.propertyId === id);
