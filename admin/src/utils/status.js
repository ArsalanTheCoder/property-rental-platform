// Badge colors for property + viewing request statuses. Values mirror the
// backend enums (propertyWorkflow.js / viewingRequestWorkflow.js); unknown
// statuses fall back to gray.
export function statusBadgeColor(status) {
  switch (status) {
    case 'published':
    case 'confirmed':
    case 'completed':
      return 'green'
    case 'draft':
      return 'blue'
    case 'pending':
    case 'unpublished':
      return 'yellow'
    case 'rejected':
    case 'cancelled':
      return 'red'
    default:
      return 'gray'
  }
}
