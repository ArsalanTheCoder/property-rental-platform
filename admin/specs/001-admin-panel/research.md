# Research: Property Rental Admin Panel

**Branch**: `001-admin-panel` | **Date**: 2026-08-13
**Input**: Technical Context from [plan.md](./plan.md)

No NEEDS CLARIFICATION markers remain — the user supplied the full technology
stack (React, JavaScript, Vite, Tailwind CSS, React Router, Axios) and all
behavioral ambiguities were resolved during the spec/clarify stages. This file
documents the remaining design decisions.

## Decision: Single frontend web app at repo root

**Rationale**: The project is exclusively a frontend Admin Panel. A single Vite
+ React application is the smallest structure that satisfies the feature;
there is no backend to co-locate.

**Alternatives considered**:
- `frontend/` + `backend/` monorepo layout — rejected: backend belongs to
  Mohammad Arsalan's module and is not part of this project.
- Multiple workspaces/packages — rejected: no shared-package need.

## Decision: Axios as the HTTP client

**Rationale**: Specified by the user. Axios gives interceptors (auth header,
401 handling) and centralized error normalization in one place.

**Alternatives considered**: native `fetch` wrappers — rejected because
interceptor-based auth/session handling and error normalization would require
more custom code.

## Decision: State management = React Context + custom hooks (no Redux/Query)

**Rationale**: The Admin Panel is an internal tool with modest state needs:
session, per-page server data, and form state. A custom `useAsyncData` hook
plus `AuthContext` covers every screen without adding a global state library.
This honors the constitution's "avoid unnecessary libraries and complexity".

**Alternatives considered**:
- Redux Toolkit — rejected: overkill for this scale; more boilerplate.
- TanStack Query — rejected: powerful cache/invalidation but adds a dependency
  and conceptual weight not needed for an internal CRUD panel; can be adopted
  later if real-time needs emerge.

## Decision: Testing = Vitest + React Testing Library + Playwright

**Rationale**: Vitest is the Vite-native test runner (same config ecosystem).
React Testing Library tests components the way users interact with them.
Playwright covers the critical end-to-end journeys required by the spec
(login, protected routes, property CRUD, AI review/save, status changes).

**Alternatives considered**: Jest (slower, separate config), Cypress (heavier
E2E setup). Vitest + RTL is the proportional choice for a Vite app.

## Decision: Isolated configurable mock layer behind VITE_USE_MOCKS

**Rationale**: The constitution requires isolated mock/service abstractions
while backend/AI contracts are undefined, and forbids permanent fake backends.
A single `mocks/mockApi.js` implements the same domain interfaces as the real
services; the switch is an env flag, so the same UI code runs against mocks
(dev) or the real API (integration). Mock data is explicitly namespaced as
development data, never production statistics.

**Alternatives considered**: per-service hardcoded conditionals scattered in
components — rejected: violates the centralized-layer principle; a mock
backend library (msw) — rejected: adds a dependency; in-memory mock module is
sufficient and proportional.

## Decision: Token storage behind an abstraction (memory + sessionStorage interim)

**Rationale**: The auth contract is pending (dependency #1). To keep sessions
across refreshes during development while avoiding a premature security
decision, the token lives in memory with an optional `sessionStorage` backing
behind a `sessionStore` abstraction. The final storage mechanism MUST follow
the backend contract and be security-reviewed before production.

**Alternatives considered**: `localStorage` by default — rejected: more
persistent exposure to XSS; decision deferred to the auth contract.

## Decision: Approval/publishing driven by config, not hardcoded statuses

**Rationale**: Spec FR-022/FR-023 mandate distinct Review → Approve → Publish
actions while forbidding hardcoded status names and transitions. A single
`config/propertyWorkflow.js` maps actions to backend contract values; until
the contract lands it is seeded from the mock and can be replaced without
touching UI components.

**Alternatives considered**: embedding status strings in components — rejected:
directly violates the constitution.

## Decision: No recent-activity subsystem

**Rationale**: Spec FR-011 explicitly excludes recent activity from the MVP
and forbids a separate tracking system. The dashboard consumes only the six
summary statistics from the backend.

## Decision: Image handling = URL-based for MVP

**Rationale**: Image upload/storage contract (dependency #9) is undefined. The
property form accepts image URLs; native upload is deferred to avoid inventing
a storage contract.

**Alternatives considered**: a frontend upload flow writing to an assumed
bucket — rejected: invents backend behavior.

## Decision: Accessibility & responsive baseline

**Rationale**: FR-046 requires desktop/tablet usability, keyboard-friendly
forms, clear labels, and readable typography. Tailwind utilities plus semantic
HTML and `aria` attributes on interactive components satisfy this without a
component library dependency.

**Alternatives considered**: a UI kit (shadcn/ui, MUI) — rejected: extra
dependency; custom Tailwind primitives are sufficient and lighter.
