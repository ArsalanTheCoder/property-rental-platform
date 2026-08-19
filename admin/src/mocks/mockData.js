// DEVELOPMENT-ONLY seed data for the mock backend (src/mocks/mockApi.js).
// Never treated as production statistics (FR-012). Never committed to real
// credentials (FR-047) — the mock admin credential is development-only.

export const mockAdmin = {
  id: 'admin-001',
  name: 'Property Admin',
  email: 'admin@rental.com',
  password: 'admin123',
}

export const mockProperties = [
  {
    propertyId: 'prop-001',
    title: 'Sunny 2-Bedroom Apartment Downtown',
    description: 'Bright two-bedroom apartment near the city center with a modern kitchen and balcony.',
    propertyType: 'apartment',
    price: 1200,
    location: 'Main Street 12, Downtown',
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['balcony', 'parking', 'furnished kitchen'],
    furnished: true,
    images: [],
    availability: 'available',
    status: 'published',
  },
  {
    propertyId: 'prop-002',
    title: 'Cozy Studio Near University',
    description: 'Compact studio walking distance to the university, ideal for students.',
    propertyType: 'studio',
    price: 700,
    location: 'Campus Road 4',
    bedrooms: 0,
    bathrooms: 1,
    amenities: ['wifi', 'laundry'],
    furnished: true,
    images: [],
    availability: 'available',
    status: 'new',
  },
  {
    propertyId: 'prop-003',
    title: 'Family House with Garden',
    description: 'Spacious three-bedroom house with a large garden and garage in a quiet suburb.',
    propertyType: 'house',
    price: 2500,
    location: 'Garden Lane 8, Suburb',
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['garden', 'garage', 'fireplace'],
    furnished: false,
    images: [],
    availability: 'rented',
    status: 'approved',
  },
]

export const mockUsers = [
  {
    userId: 'user-001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 555 0101',
    'authentication information': { method: 'email', verified: true },
    favorites: ['prop-001'],
  },
  {
    userId: 'user-002',
    name: 'Bob Williams',
    email: 'bob@example.com',
    phone: '+1 555 0102',
    'authentication information': { method: 'email', verified: false },
    favorites: [],
  },
  {
    userId: 'user-003',
    name: 'Carol Chen',
    email: 'carol@example.com',
    phone: '+1 555 0103',
    'authentication information': { method: 'email', verified: true },
    favorites: ['prop-001', 'prop-003'],
  },
]

export const mockViewingRequests = [
  {
    viewingId: 'view-001',
    userId: 'user-001',
    propertyId: 'prop-001',
    userName: 'Alice Johnson',
    userPhone: '+1 555 0101',
    date: '2026-08-20',
    time: '10:00',
    message: 'Interested in a weekend viewing, preferably Saturday morning.',
    status: 'Pending',
    createdAt: '2026-08-12T09:30:00Z',
  },
  {
    viewingId: 'view-002',
    userId: 'user-002',
    propertyId: 'prop-003',
    userName: 'Bob Williams',
    userPhone: '+1 555 0102',
    date: '2026-08-22',
    time: '14:00',
    message: '',
    status: 'Pending',
    createdAt: '2026-08-12T11:00:00Z',
  },
  {
    viewingId: 'view-003',
    userId: 'user-003',
    propertyId: 'prop-002',
    userName: 'Carol Chen',
    userPhone: '+1 555 0103',
    date: '2026-08-15',
    time: '09:30',
    message: 'Please confirm the exact address.',
    status: 'Confirmed',
    createdAt: '2026-08-10T08:15:00Z',
  },
]

export const mockInquiries = [
  {
    inquiryId: 'inq-001',
    tenant: { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 555 0101' },
    propertyId: 'prop-001',
    message: 'Is the apartment available for a one-year lease starting September 1?',
    createdAt: '2026-08-11T15:20:00Z',
    status: 'new',
  },
  {
    inquiryId: 'inq-002',
    tenant: { name: 'David Miller', email: 'david@example.com', phone: '+1 555 0104' },
    propertyId: 'prop-002',
    message: 'Do you offer short-term rentals for three months?',
    createdAt: '2026-08-12T10:45:00Z',
    status: undefined,
  },
]
