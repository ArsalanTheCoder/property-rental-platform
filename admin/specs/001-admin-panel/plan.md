# Implementation Plan: Property Rental Admin Panel

**Branch**: `001-admin-panel` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-admin-panel/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build the **Property Rental Admin Panel** — a frontend-only React web
application owned by Muhammad Hanif. It provides admin authentication and
protected routes, a dashboard, property management (list/add/edit/detail/
remove), distinct Review → Approve → Publish actions, an AI property content
generation and review workflow, inquiry management, viewing request
management with status updates, and user management. All backend and AI
communication flows through a centralized API/service layer with isolated,
configurable mock abstractions until the backend (Mohammad Arsalan) and AI
(Sanaullah) contracts land. No backend, database, AI-model, tenant-site, or
mobile work is included.

## Technical Context

**Language/Version**: JavaScript (ES2022+; Node.js 20+ for tooling)
**Primary Dependencies**: React 18, Vite, React Router, Tailwind CSS, Axios, Vitest
**Storage**: N/A
<!-- No local persistence; in-memory/session auth token only (see Risks). -->
**Testing**: Vitest + React Testing Library + Playwright (E2E)
**Target Platform**: Web (modern browsers; desktop and tablet)
**Project Type**: web (frontend-only)
**Performance Goals**: fast SPA boot with no unneeded bundle weight; keep dependency count low
**Constraints**: frontend only; external REST APIs consumed via a centralized layer; no secrets in source; no hardcoded backend/AI contracts; no recent-activity tracking
**Scale/Scope**: internal admin users (small staff); thousands of records per list domain

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Gate | Status |
|---|------|--------|
| 1 | **Scope Integrity**: plan covers ONLY Admin Panel features listed in spec; no tenant/mobile/backend/DB/AI-model planning | PASS — strictly frontend Admin Panel |
| 2 | **Integration Boundaries**: backend/AI owned by others; isolated configurable mocks; no invented permanent contracts | PASS — service abstractions + mocks behind env switch |
| 3 | **AI Workflow**: UI/workflow in scope; AI logic out; separate AI service boundary; no hardcoded AI content | PASS — `aiService` abstraction; mock returns clearly-marked dev content |
| 4 | **Centralized API Layer**: no scattered raw HTTP in components | PASS — `api/http` + feature services |
| 5 | **Security & Secrets**: protected routes; no secrets/credentials in source; graceful 401/403/expired-session | PASS — route guard, interceptor, env-driven config |
| 6 | **Spec-Driven**: implementation only after tasks stage; vertical increments with acceptance criteria | PASS — phased plan feeding `/sp.tasks` |
| 7 | **Simplicity**: avoid unnecessary libraries and abstractions | PASS — React Context + hooks; no Redux/Query layer |

Post-design re-check: architecture below introduces no new principle
violations. Complexity Tracking is empty (see below).

## Project Structure

### Documentation (this feature)

```text
specs/001-admin-panel/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

Single Vite + React web application at the repository root (frontend only;
no backend directory exists in this project).

```text
src/
├── main.jsx                 # App entry (router provider, CSS)
├── App.jsx                  # Route tree
├── config/
│   └── env.js               # Reads VITE_* env vars; VITE_USE_MOCKS toggle
├── api/
│   ├── http.js              # Centralized Axios instance + auth interceptor + 401 handling
│   └── endpoints.js         # Endpoint path constants (contract placeholders)
├── services/
│   ├── authService.js       # login/logout/getSession (real + mock)
│   ├── propertyService.js   # list/get/create/update/remove/approve/publish
│   ├── inquiryService.js    # list/get
│   ├── viewingRequestService.js  # list/get/updateStatus
│   ├── userService.js       # list/get/search
│   └── aiService.js         # generatePropertyContent (AI boundary, mock-backed)
├── mocks/
│   ├── mockApi.js           # In-memory mock backend (data + latency + failure sim)
│   └── mockData.js          # Seed records for properties, users, viewing requests, inquiries
├── models/
│   └── index.js             # Property, User, ViewingRequest, Inquiry shapes (contracts)
├── config/
│   └── propertyWorkflow.js  # Review/Approve/Publish action config (no hardcoded status names)
├── context/
│   ├── AuthContext.jsx      # Session state, login/logout, protected access
│   └── ToastContext.jsx     # Success/error feedback toasts
├── hooks/
│   ├── useAsyncData.js      # loading/error/data + retry for API calls
│   └── useForm.js           # field state + validation
├── routes/
│   └── ProtectedRoute.jsx   # Auth guard wrapper
├── components/
│   ├── ui/                  # Button, Input, Select, Textarea, Modal, ConfirmDialog,
│   │                        # Badge, Spinner, LoadingState, EmptyState, ErrorState, Card, Table
│   ├── layout/              # AdminLayout (sidebar + header + outlet), Sidebar, Header
│   └── properties/
│       └── AiContentGenerator.jsx  # generate/review/edit/accept/save workflow
├── pages/
│   ├── LoginPage/           # LoginPage.jsx, loginPage.validation.js
│   ├── DashboardPage/       # stat cards from dashboardService
│   ├── PropertiesPage/      # list + search/filter + actions
│   ├── PropertyDetailPage/  # full details + workflow actions + AI generate
│   ├── PropertyFormPage/    # add/edit form (+ AI generator integration)
│   ├── InquiriesPage/       # list + detail
│   ├── ViewingRequestsPage/ # list + detail + status actions
│   └── UsersPage/           # list + detail
└── utils/
    ├── validators.js        # required, email, numeric, url, etc.
    └── format.js            # price/date formatting

tests/
├── unit/                    # validators, services (mock-backed), auth guard
├── component/               # RTL: login form, property form, workflow actions, AI generator
└── e2e/                     # Playwright: login, protected route, property CRUD, AI save, status change
```

**Structure Decision**: Single web application (Vite + React) at repo root.
This project is exclusively a frontend Admin Panel, so a single `src/` tree
with colocated feature folders is the simplest proportional structure. No
backend directory is planned (backend belongs to Mohammad Arsalan's module).
Tests are split into `tests/unit`, `tests/component`, and `tests/e2e`.

## Architecture

### 1. Routing Structure

- Public: `/login`
- Protected (inside `ProtectedRoute` + `AdminLayout`):
  - `/dashboard` — Dashboard
  - `/properties` — list (search/filter)
  - `/properties/new` — add property
  - `/properties/:propertyId` — details (workflow actions + AI generate)
  - `/properties/:propertyId/edit` — edit property
  - `/inquiries` and `/inquiries/:inquiryId`
  - `/viewing-requests` and `/viewing-requests/:viewingId`
  - `/users` and `/users/:userId`
- `*` — 404 (inside layout when authenticated)

### 2. Layout / Component Architecture

- `AdminLayout` renders `Sidebar`, `Header` (profile + logout), and an
  `<Outlet/>` for the main content area (FR-008, FR-009).
- Small, reusable `components/ui` primitives keep forms, tables, and states
  consistent (FR-036–FR-041).
- Pages compose primitives and services; no business/API logic inside presentational components.

### 3. State Management

- **Auth/session**: `AuthContext` (React Context) — single source of truth for
  the session; `ProtectedRoute` reads it for route guards.
- **Server data**: lightweight `useAsyncData` hook (id + fetcher + deps) that
  exposes `{ data, loading, error, reload }`. No global cache/Redux layer —
  proportional to an internal tool.
- **Forms**: `useForm` hook (values, errors, touched, submit gating).
- **Feedback**: `ToastContext` for success/error notifications.

### 4. API Service Layer

- `api/http.js`: single Axios instance; base URL from `VITE_API_BASE_URL`;
  request interceptor attaches the auth token; response interceptor normalizes
  errors into `ApiError` and, on 401/expired session, clears the session and
  redirects to `/login` (FR-006, FR-047).
- `api/endpoints.js`: central endpoint constants; values are contract
  placeholders to be confirmed with Mohammad Arsalan (dependency #6).
- Feature services (`authService`, `propertyService`, `inquiryService`,
  `viewingRequestService`, `userService`) expose domain operations only —
  UI components never call Axios directly (FR-042).

### 5. Authentication / Session Boundary

- Login form → `authService.login()`; on success, session stored in memory
  (+ optional `sessionStorage` behind an abstraction; final mechanism pending
  dependency #1). `AuthContext` exposes `user`, `token`, `login`, `logout`.
- `ProtectedRoute` redirects unauthenticated users to `/login` (FR-003).
- 401 from any service → centralized logout + redirect (FR-006).
- No credentials, keys, or tokens ever hardcoded; env-driven only (FR-047).

### 6–11. Feature Services

- **PropertyService**: `list({search, filters})`, `get(id)`, `create(data)`,
  `update(id, data)`, `remove(id)`, `approve(id)`, `publish(id)`. Property
  shape preserved exactly (FR-017, FR-045).
- **Approval/Publishing**: distinct Review/Approve/Publish actions are exposed
  by the UI (FR-022). The exact status names and transition rules live in
  `config/propertyWorkflow.js`, seeded from the mock, NOT hardcoded in
  components; they must be replaced with Mohammad Arsalan's contract (FR-023).
- **InquiryService**: `list()`, `get(id)` only — no invented mutation actions
  (FR-028, FR-029).
- **ViewingRequestService**: `list()`, `get(id)`, `updateStatus(id, status)`.
  Status values Pending/Confirmed/Rejected/Cancelled/Completed and allowed
  transitions come from config; backend transitions take precedence (FR-031,
  FR-032).
- **UserService**: `list({search})`, `get(id)` — read-mostly (FR-033–FR-035).
- **AiService** (separate boundary, FR-026/FR-043): `generatePropertyContent(payload)`
  where payload conceptually carries propertyType, price, location, bedrooms,
  bathrooms, amenities, furnished, availability, and raw notes (FR-024). The
  interface returns `{ title, description }`. Real implementation connects to
  Sanaullah's endpoint later; the mock returns clearly-marked development
  content. Exact request/response schema is NOT invented here (dependency #7).

### 12. Validation Strategy

- `utils/validators.js`: required, email, numeric (price), integer (bedrooms/
  bathrooms), URL/URI (images), min/max length (title/description).
- `useForm` validates on submit (and per-field on blur) and blocks submission
  while invalid; API errors map back to fields or form-level banner (FR-018,
  FR-040).

### 13. Loading / Error / Empty / Success Strategy

- `useAsyncData` + `LoadingState`, `EmptyState`, `ErrorState` (with retry)
  shared across all list/detail pages (FR-036–FR-038, FR-013).
- `ToastContext` for success feedback (FR-039).
- `ConfirmDialog` wrapper for all destructive actions, showing the property
  being removed (FR-020, FR-041).
- Mock layer can simulate failures to exercise error states during development.

### 14. Responsive UI Approach

- Tailwind utility-first classes; grid/flex layouts that collapse on tablet
  widths; sidebar collapses to icon/drawer below desktop; tables scroll
  horizontally on small screens. Desktop and tablet are the required targets
  (FR-010, FR-046). Keyboard-operable forms and semantic labels throughout.

### 15. Testing Strategy

- **Unit** (Vitest): validators, services against mock API, `ProtectedRoute`
  logic, workflow config mapping.
- **Component** (Vitest + React Testing Library): login form validation and
  error states, property form add/edit, workflow action buttons, AI
  generator (generate/regenerate/edit/save), viewing status actions.
- **E2E** (Playwright): unauthenticated → login redirect; login → dashboard;
  property create → list → edit → delete; AI generate → review → save; viewing
  status change; logout.
- Coverage mapped to spec Success Criteria SC-001…SC-008.

## Development Phases (vertical, testable increments)

1. **Foundation**: scaffold Vite + React + Tailwind; env config; `api/http`;
   base UI primitives; router skeleton; mock layer + seed data; Vitest setup.
   *Verify: app boots, tests run.*
2. **Authentication + Protected Layout**: LoginPage, AuthContext,
   ProtectedRoute, AdminLayout; unit + E2E login/redirect tests.
3. **Dashboard**: dashboard statistics cards from mock/backend; loading/
   empty/error/retry (SC-001).
4. **Property Management**: list + search/filter, add, edit, detail, remove
   with confirmation; property form validation (SC-002, SC-005, SC-006).
5. **AI Content Generation/Review**: `AiContentGenerator` + `aiService`;
   generate/regenerate/edit/accept/save; never persists mock AI output as
   production data (SC-003).
6. **Approval/Publishing Workflow**: distinct Review/Approve/Publish actions
   driven by `config/propertyWorkflow`; surfacing backend rejections (SC-002).
7. **Inquiry Management**: list + detail from `inquiryService` (mock-backed).
8. **Viewing Request Management**: list + detail + status updates (SC-004).
9. **User Management**: list + detail + search where supported.
10. **Testing & Integration Verification**: full unit/component/E2E pass,
    quickstart run-through, constitution compliance review.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. `config/propertyWorkflow` and the mock/service
abstraction are required by the constitution (isolated configurable mocks,
no hardcoded contracts), not added complexity. Table intentionally empty.

## Risks & Integration Dependencies

- **Backend contract unknown (Mohammad Arsalan)**: auth mechanism, property
  status/availability enumerations, inquiry contract, viewing transitions,
  endpoint formats. *Mitigation*: isolated `mocks/` + `api/endpoints.js`
  placeholders + workflow config; swap behind `VITE_USE_MOCKS`.
- **AI contract unknown (Sanaullah)**: request/response schema. *Mitigation*:
  `aiService` interface; mock behind same toggle; UI depends only on the
  interface.
- **Token storage decision** deferred to auth contract; interim sessionStorage
  behind abstraction, flagged for security review.
- **Image upload/storage contract (dependency #9)**: property form accepts
  image URLs for now; native upload deferred until backend defines storage.
- **CORS / environment wiring** to be verified when real endpoints connect.

## Definition of Done (this plan)

- All phases 1–10 planned and traceable to spec FRs/SCs.
- Architecture honors every constitution principle (gate table above).
- Artifacts present: `research.md`, `data-model.md`, `contracts/`,
  `quickstart.md`, updated agent context.
- Ready for `/sp.tasks` to break phases into tasks with acceptance criteria.
