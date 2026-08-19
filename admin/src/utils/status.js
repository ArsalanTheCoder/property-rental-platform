export function statusBadgeColor(status) {
  switch (status) {
    case 'published':
      return 'green'
    case 'approved':
    case 'reviewed':
      return 'blue'
    case 'new':
    case 'submitted':
      return 'yellow'
    default:
      return 'gray'
  }
}
