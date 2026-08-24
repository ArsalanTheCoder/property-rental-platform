export function createProperty(data = {}) {
  return {
    propertyId: data.propertyId ?? '',
    title: data.title ?? '',
    description: data.description ?? '',
    propertyType: data.propertyType ?? '',
    price: data.price ?? 0,
    location: data.location ?? '',
    bedrooms: data.bedrooms ?? 0,
    bathrooms: data.bathrooms ?? 0,
    amenities: data.amenities ?? [],
    furnished: data.furnished ?? false,
    images: data.images ?? [],
    availability: data.availability ?? '',
    status: data.status ?? '',
  }
}

export function createUser(data = {}) {
  return {
    userId: data.userId ?? '',
    name: data.name ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    'authentication information': data['authentication information'] ?? {},
    favorites: data.favorites ?? [],
  }
}

export function createViewingRequest(data = {}) {
  return {
    viewingId: data.viewingId ?? '',
    userId: data.userId ?? '',
    propertyId: data.propertyId ?? '',
    userName: data.userName ?? '',
    userPhone: data.userPhone ?? '',
    date: data.date ?? '',
    time: data.time ?? '',
    message: data.message ?? '',
    status: data.status ?? '',
    createdAt: data.createdAt ?? '',
  }
}

export function createInquiry(data = {}) {
  return {
    inquiryId: data.inquiryId ?? '',
    tenant: data.tenant ?? {},
    propertyId: data.propertyId ?? '',
    message: data.message ?? '',
    createdAt: data.createdAt ?? '',
    status: data.status ?? undefined,
  }
}
