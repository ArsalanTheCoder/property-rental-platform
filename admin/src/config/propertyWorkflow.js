// Development-only configurable workflow and enumerations for properties.
// INTEGRATION (owner: Mohammad Arsalan, spec dependencies #2/#3/#6): the exact
// status/availability/property-type values and the Review → Approve → Publish
// transition rules will follow the backend contract. Replace these values when
// that contract lands; components and mocks read them from this config and
// never hardcode status names or transition rules (FR-022, FR-023).

export const propertyWorkflow = {
  initialStatus: 'new',
  statuses: ['new', 'submitted', 'reviewed', 'approved', 'published'],
  availability: ['available', 'rented', 'maintenance'],
  propertyTypes: ['house', 'apartment', 'studio'],
  actions: [
    { action: 'Review', allowedFrom: ['new', 'submitted'], resultStatus: 'reviewed' },
    { action: 'Approve', allowedFrom: ['reviewed'], resultStatus: 'approved' },
    { action: 'Publish', allowedFrom: ['approved'], resultStatus: 'published' },
  ],
}

export function getAllowedActions(status) {
  return propertyWorkflow.actions.filter((action) => action.allowedFrom.includes(status))
}
