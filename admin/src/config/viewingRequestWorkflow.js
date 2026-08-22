// Viewing request workflow — mirrors the real backend contract:
// statuses are enforced by backend/src/validators/viewing.validator.js and
// backend/src/models/ViewingRequest.js (pending | confirmed | rejected |
// cancelled | completed). Components, services, and mocks read this config
// and never hardcode status names or transition rules (FR-031, FR-032).

export const viewingRequestWorkflow = {
  statuses: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
  actions: [
    { action: 'Confirm', allowedFrom: ['pending'], resultStatus: 'confirmed' },
    { action: 'Reject', allowedFrom: ['pending'], resultStatus: 'rejected' },
    { action: 'Cancel', allowedFrom: ['pending', 'confirmed'], resultStatus: 'cancelled' },
    { action: 'Mark completed', allowedFrom: ['confirmed'], resultStatus: 'completed' },
  ],
}

export function getAllowedViewingActions(status) {
  return viewingRequestWorkflow.actions.filter((action) => action.allowedFrom.includes(status))
}
