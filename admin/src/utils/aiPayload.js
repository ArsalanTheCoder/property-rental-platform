// Conceptual AI input payload (FR-024): structured property information
// available in the property form. The exact AI request/response schema is an
// integration dependency owned by Sanaullah (spec dependency #7) and is NOT
// invented here — this only assembles the domain inputs the UI has on hand.

function splitList(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function buildAiPayload(values = {}) {
  return {
    propertyType: values.propertyType ?? '',
    price: values.price != null && values.price !== '' ? Number(values.price) : undefined,
    location: values.location ?? '',
    bedrooms:
      values.bedrooms != null && values.bedrooms !== '' ? Number(values.bedrooms) : undefined,
    bathrooms:
      values.bathrooms != null && values.bathrooms !== '' ? Number(values.bathrooms) : undefined,
    amenities: Array.isArray(values.amenities) ? values.amenities : splitList(values.amenities),
    furnished: Boolean(values.furnished),
    availability: values.availability ?? '',
    notes: values.notes ?? '',
  }
}
