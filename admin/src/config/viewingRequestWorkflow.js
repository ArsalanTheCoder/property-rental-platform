// Development-only configurable workflow for viewing request statuses.
// INTEGRATION (owner: Mohammad Arsalan, spec dependency #2): the exact status
// values and allowed transitions will follow the backend contract. Replace
// these values when that contract lands; components and mocks read them from
// this config and never hardcode status names or transition rules (FR-031,
// FR-032).

export const viewingRequestWorkflow = {
  statuses: ['Pending', 'Confirmed', 'Rejected', 'Cancelled', 'Completed'],
  actions: [
    { action: 'Confirm', allowedFrom: ['Pending'], resultStatus: 'Confirmed' },
    { action: 'Reject', allowedFrom: ['Pending'], resultStatus: 'Rejected' },
    { action: 'Cancel', allowedFrom: ['Pending', 'Confirmed'], resultStatus: 'Cancelled' },
    { action: 'Mark completed', allowedFrom: ['Confirmed'], resultStatus: 'Completed' },
  ],
}

export function getAllowedViewingActions(status) {
  return viewingRequestWorkflow.actions.filter((action) => action.allowedFrom.includes(status))
}
