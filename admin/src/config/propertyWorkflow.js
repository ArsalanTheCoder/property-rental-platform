// Property workflow and enumerations — mirrors the real backend contract:
// statuses/types are enforced by backend/src/validators/property.validator.js
// and backend/src/models/Property.js (draft | pending | published |
// unpublished; Apartment | House | Villa | Studio | Commercial | Penthouse).
// Availability is a boolean server-side; the UI represents it as
// available/rented. Components, services, and mocks read this config and
// never hardcode status names or transition rules (FR-022, FR-023).

export const propertyWorkflow = {
  initialStatus: 'draft',
  statuses: ['draft', 'pending', 'published', 'unpublished'],
  availability: ['available', 'rented'],
  propertyTypes: ['Apartment', 'House', 'Villa', 'Studio', 'Commercial', 'Penthouse'],
  // Status transitions go through PATCH /admin/properties/:id/status.
  actions: [
    {
      action: 'Publish',
      allowedFrom: ['draft', 'pending', 'unpublished'],
      resultStatus: 'published',
    },
    { action: 'Unpublish', allowedFrom: ['published'], resultStatus: 'unpublished' },
  ],
}

export function getAllowedActions(status) {
  return propertyWorkflow.actions.filter((action) => action.allowedFrom.includes(status))
}
