---

description: "Task list for the Property Rental Admin Panel (001-admin-panel) — local development via OpenCode"
---

# Tasks: Property Rental Admin Panel

**Input**: Design documents from `/specs/001-admin-panel/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Tests**: Included — the specification and user input explicitly require unit/component/integration testing and local smoke testing (spec FR-036–FR-041, Success Criteria SC-001…SC-008).
**Organization**: Tasks follow the approved 10-phase vertical strategy from plan.md. Phases 2–9 map to user stories from spec.md. All tasks run locally against mocks on `http://localhost:3000`; no deployment or backend work is included.

**Integration marking**: Tasks annotated `(INTEGRATION: … PENDING)` build frontend integration boundaries and mocks only. They MUST NOT invent permanent backend/AI contracts. Replace with real adapters when the backend (Mohammad Arsalan) and AI (Sanaullah) contracts land.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US8)
- Include exact file paths in descriptions

## Path Conventions

- Single Vite + React web app at repository root: `src/`, `tests/`
- Feature services: `src/services/`; centralized HTTP: `src/api/`; mocks: `src/mocks/`

---

## Phase 1: Setup & Foundation (Shared Infrastructure)

**Purpose**: Project initialization and the shared infrastructure every user story needs (FR-042 centralized layer, FR-045 shared field names, FR-036–FR-041 UI states).

### 1a. Setup

- [X] T001 Create Vite + React (JavaScript) scaffold at repo root: `package.json`, `index.html`, `vite.config.js`, `src/main.jsx`, `src/App.jsx` (per plan.md)
- [X] T002 Configure Vite dev server to run on `http://localhost:3000` (`server.port: 3000`) in `vite.config.js` (user requirement: local dev on port 3000)
- [X] T003 [P] Install and configure Tailwind CSS: `tailwind.config.js`, `postcss.config.js`, Tailwind directives in `src/index.css`
- [X] T004 [P] Add dependencies to `package.json`: react-router-dom, axios, vitest, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, @playwright/test (no Redux, no React Query per plan.md)
- [X] T005 [P] Add npm scripts in `package.json`: `dev`, `build`, `preview`, `test`, `test:unit`, `test:e2e`
- [X] T006 Create environment config `src/config/env.js` reading `VITE_API_BASE_URL` and `VITE_USE_MOCKS` (no secrets in source, FR-047)
- [X] T007 [P] Create `.env.example` and `.env` with `VITE_USE_MOCKS=true` (dev default; mocks isolated per constitution)
- [X] T008 [P] Create folder skeleton per plan.md: `src/{api,services,mocks,models,config,context,hooks,routes,components/ui,components/layout,components/properties,pages,utils}`, `tests/{unit,component,e2e}`
- [X] T009 [P] Create Playwright config `playwright.config.js` (baseURL `http://localhost:3000`, `tests/e2e/` dir)

### 1b. Foundational (Blocking Prerequisites)

- [X] T010 Create shared model shapes in `src/models/index.js`: Property, User, ViewingRequest, Inquiry — exact field names from data-model.md (FR-045, do not rename shared fields)
- [X] T011 Create centralized Axios client `src/api/http.js`: baseURL from env, auth-header interceptor, error normalization to `ApiError { status, message, fields? }`, 401/expired-session handling (FR-006, FR-042)
- [X] T012 Create endpoint path constants `src/api/endpoints.js` as contract placeholders (INTEGRATION: backend endpoints PENDING — replace values, never rename domain interfaces)
- [X] T013 Create isolated mock backend `src/mocks/mockApi.js` implementing the service interfaces with simulated latency and failure modes (dev-only, behind `VITE_USE_MOCKS`; constitution-required mock abstraction)
- [X] T014 [P] Create mock seed data `src/mocks/mockData.js`: mock admin, properties, users, viewing requests, inquiries (explicitly marked development data, never production statistics, FR-012)
- [X] T015 Create async data hook `src/hooks/useAsyncData.js` exposing `{ data, loading, error, reload }` (loading/empty/error/retry baseline, FR-036–FR-038)
- [X] T016 Create form hook `src/hooks/useForm.js` (values, errors, touched, submit gating) (FR-040)
- [X] T017 [P] Create validators `src/utils/validators.js`: required, email, numeric (price), integer (bedrooms/bathrooms), URL (images), min/max length (FR-018)
- [X] T018 [P] Create formatters `src/utils/format.js` (price, date/time)
- [X] T019 [P] Create base UI primitives in `src/components/ui/`: Button, Spinner, Badge, Card
- [X] T020 [P] Create base UI primitives in `src/components/ui/`: Input, Select, Textarea with label + inline error message
- [X] T021 [P] Create `src/components/ui/Modal.jsx` and `src/components/ui/ConfirmDialog.jsx` (confirmation for destructive actions, FR-041)
- [X] T022 [P] Create state components `src/components/ui/`: LoadingState, EmptyState, ErrorState (with retry) (FR-036–FR-038, FR-013)
- [X] T023 [P] Create `src/components/ui/Table.jsx` (responsive column layout)
- [X] T024 Create ToastContext `src/context/ToastContext.jsx` + toast container (success/error feedback, FR-039)
- [X] T025 Configure Vitest: `vitest.config.js` (jsdom), setup file with `@testing-library/jest-dom`
- [X] T026 Create minimal router skeleton in `src/App.jsx` (public `/login` placeholder + protected shell) so the app boots; filled in Phase 2 (US1)

**Checkpoint**: Foundation ready — `npm run dev` boots on `http://localhost:3000`, `npm test` passes, shared primitives/services/mocks available. No user story work before this completes.

---

## Phase 2: User Story 1 - Admin Authentication & Protected Layout (Priority: P1) 🔐 MVP

**Goal**: Administrator can log in, reach the Dashboard, and be blocked from protected routes while unauthenticated; consistent AdminLayout with navigation and logout.
**Independent Test**: Open `/dashboard` unauthenticated → redirected to `/login`. Log in with mock admin → Dashboard. Log in with bad credentials → error. Logout → protected routes blocked again.

### Tests for User Story 1

- [X] T027 [P] [US1] Component test: `tests/component/login.test.jsx` — LoginPage validates required fields, shows error on invalid credentials, loading state, no duplicate submit (FR-001, FR-006, FR-007)
- [X] T028 [P] [US1] E2E test: `tests/e2e/auth.spec.js` — unauthenticated redirect, login success → dashboard, invalid login, logout blocks access (SC-001)

### Implementation for User Story 1

- [X] T029 [US1] Create AuthContext `src/context/AuthContext.jsx`: session state (token, admin), login/logout; token in memory + optional `sessionStorage` behind a `sessionStore` abstraction (INTEGRATION: auth mechanism PENDING — FR-005; storage decision to follow backend contract)
- [X] T030 [US1] Create `src/services/authService.js`: login/logout/getSession against the mock abstraction (INTEGRATION: backend auth contract PENDING — FR-005)
- [X] T031 [US1] Create LoginPage `src/pages/LoginPage/LoginPage.jsx`: email/username + password, validation, loading state, clear invalid-credentials error (FR-001, FR-002, FR-006, FR-007)
- [X] T032 [US1] Create `src/routes/ProtectedRoute.jsx`: redirects unauthenticated users to `/login`, never renders protected content (FR-003)
- [X] T033 [US1] Create AdminLayout `src/components/layout/AdminLayout.jsx`: Sidebar + Header + main `<Outlet/>` (FR-008)
- [X] T034 [P] [US1] Create Sidebar `src/components/layout/Sidebar.jsx`: navigation to Dashboard, Properties, Inquiries, Viewing Requests, Users (FR-009)
- [X] T035 [P] [US1] Create Header `src/components/layout/Header.jsx`: admin profile/account area + logout action (FR-008)
- [X] T036 [US1] Wire auth flow in `src/App.jsx`: `/login` public; protected routes wrapped in `ProtectedRoute` + `AdminLayout`; logout clears session and redirects to `/login` (FR-002, FR-004, FR-006)

**Checkpoint**: US1 fully functional — login, protected routes, layout, logout, with passing tests.

---

## Phase 3: User Story 2 - Admin Dashboard Overview (Priority: P1) 📊

**Goal**: Dashboard shows the six MVP summary statistics sourced from backend/mock data with loading, empty, error, and retry states.
**Independent Test**: Log in → Dashboard renders six stat cards matching mock/backend data; simulate API failure → error state with retry; zero records → empty state, no fabricated numbers.

### Tests for User Story 2

- [X] T037 [P] [US2] Component test: `tests/component/dashboard.test.jsx` — six stat cards render, error state + retry, no hardcoded stats (FR-011, FR-012, FR-013)

### Implementation for User Story 2

- [X] T038 [US2] Create `src/services/dashboardService.js`: `getSummary()` for the six statistics (INTEGRATION: backend stats endpoint PENDING)
- [X] T039 [US2] Add mock dashboard summary handler in `src/mocks/mockApi.js` computed from mock seed data (never hardcoded production numbers, FR-012)
- [X] T040 [US2] Create DashboardPage `src/pages/DashboardPage/DashboardPage.jsx`: cards for total/published/pending properties, total users, pending inquiries, pending viewing requests, using `useAsyncData` + Loading/Empty/Error/retry (FR-011, FR-013)
- [X] T041 [US2] Wire `/dashboard` route in `src/App.jsx` (post-login default destination, FR-002)

**Checkpoint**: Dashboard verified independently.

---

## Phase 4: User Story 3 - Property Management (CRUD) (Priority: P1) 🏠

**Goal**: List, add, edit, detail, and remove properties with validation and confirmation, all through the property service.
**Independent Test**: Create a property → appears in list → open details → edit a field → delete with confirmation → removed from list.

### Tests for User Story 3

- [X] T042 [P] [US3] Component test: `tests/component/propertyForm.test.jsx` — required-field validation, invalid format errors, submit success/API-error feedback (FR-018)
- [X] T043 [P] [US3] E2E test: `tests/e2e/properties.spec.js` — create → list → detail → edit → delete flow (SC-002)

### Implementation for User Story 3

- [X] T044 [US3] Create `src/services/propertyService.js`: list({search, filters}), get, create, update, remove (INTEGRATION: backend property endpoints PENDING — FR-044)
- [X] T045 [US3] Add property CRUD handlers in `src/mocks/mockApi.js` using `src/models/index.js` shapes (dev-only)
- [X] T046 [US3] Create PropertiesPage `src/pages/PropertiesPage/PropertiesPage.jsx`: table with image, title, property type, location, price, bedrooms, status, availability, actions; search/filter where supported; loading/empty/error (FR-014, FR-015, FR-016)
- [X] T047 [US3] Create PropertyFormPage `src/pages/PropertyFormPage/PropertyFormPage.jsx` (add + edit modes): full agreed property structure (FR-017), validation, submission progress, success/error feedback, no silent overwrite (FR-018, FR-019)
- [X] T048 [US3] Create PropertyDetailPage `src/pages/PropertyDetailPage/PropertyDetailPage.jsx`: all fields per FR-021; placeholder for properties with no images (FR-021)
- [X] T049 [US3] Add delete-with-confirmation flow using `ConfirmDialog` (identifies the property, shows progress, refreshes list on success) (FR-020, FR-041)
- [X] T050 [US3] Wire routes in `src/App.jsx`: `/properties`, `/properties/new`, `/properties/:propertyId`, `/properties/:propertyId/edit` (FR-016)

**Checkpoint**: US3 fully functional and independently testable.

---

## Phase 5: User Story 5 - AI Property Content Generation & Review (Priority: P2) ✨

**Goal**: Administrator requests AI-generated title/description from structured property inputs, reviews, edits, and saves final content through the AI service boundary.
**Independent Test**: On a property, request generation → title + description displayed with loading state → edit → save → saved via propertyService; AI failure → error + retry; no AI output saved without explicit admin save.

### Tests for User Story 5

- [X] T051 [P] [US5] Component test: `tests/component/aiGenerator.test.jsx` — generate → display → edit → accept/save; error + retry; regenerate replaces suggestion (FR-025, FR-027)

### Implementation for User Story 5

- [X] T052 [US5] Create `src/services/aiService.js`: `generatePropertyContent(input) → { title, description }` (separate AI boundary, FR-026, FR-043; INTEGRATION: AI schema PENDING — Sanaullah, do NOT invent the wire schema)
- [X] T053 [US5] Add mock AI generation handler in `src/mocks/mockApi.js` returning clearly-marked development content (never production data, FR-027)
- [X] T054 [US5] Build the conceptual AI input payload in `src/utils/aiPayload.js`: propertyType, price, location, bedrooms, bathrooms, amenities, furnished, availability, raw notes (FR-024)
- [X] T055 [US5] Create `src/components/properties/AiContentGenerator.jsx`: generate action, loading state, generated title/description display, editable fields, accept/use, regenerate, error handling, retry (FR-024, FR-025)
- [X] T056 [US5] Integrate `AiContentGenerator` into PropertyFormPage and PropertyDetailPage; saving final content persists via `propertyService.update` (FR-024)
- [X] T057 [US5] Enforce that generated content is never auto-persisted — only an explicit admin save writes it (FR-027, SC-003)

**Checkpoint**: US5 independently testable.

---

## Phase 6: User Story 4 - Property Approval & Publishing Workflow (Priority: P1) ✅

**Goal**: Administrator performs distinct Review, Approve, and Publish actions driven by a configurable workflow abstraction; no hardcoded status names/transitions.
**Independent Test**: From list or details, perform Approve then Publish → status updates via mock/backend; unsupported transition surfaces backend response, no fabricated success.

### Tests for User Story 6

- [X] T058 [P] [US4] Component test: `tests/component/propertyWorkflow.test.jsx` — actions render from config, disabled/invalid transitions surface rejection, success feedback (FR-022, FR-023)

### Implementation for User Story 6

- [X] T059 [US4] Create workflow config `src/config/propertyWorkflow.js`: maps Review/Approve/Publish actions to config values seeded from mock (no hardcoded production status names or transition rules, FR-022, FR-023)
- [X] T060 [US4] Add `approve(propertyId)` and `publish(propertyId)` to `src/services/propertyService.js` (INTEGRATION: backend transitions PENDING — FR-022)
- [X] T061 [US4] Add approve/publish mock handlers in `src/mocks/mockApi.js` driven by `propertyWorkflow.js` (dev-only)
- [X] T062 [US4] Add workflow action controls (Review, Approve, Publish) to PropertyDetailPage and PropertiesPage reflecting current status + allowed actions from config (FR-022)
- [X] T063 [US4] Surface backend rejection/403 responses for disallowed transitions without fabricating success (FR-022 scenario 3)

**Checkpoint**: US4 independently testable.

---

## Phase 7: User Story 7 - Inquiry Management (Priority: P2) 💬

**Goal**: Administrator views inquiry list and details (tenant, property, message, date/time, status when provided); only actions the backend supports.
**Independent Test**: Open Inquiries → list renders from mock; open an inquiry → details; loading/empty/error states work.

### Tests for User Story 7

- [X] T064 [P] [US7] Component test: `tests/component/inquiries.test.jsx` — list + detail render, empty and error states (FR-028, FR-036–FR-038)

### Implementation for User Story 7

- [X] T065 [US7] Create `src/services/inquiryService.js`: list, get only — no invented mutation actions (FR-028, FR-029; INTEGRATION: inquiry contract PENDING — mock only, no permanent fields)
- [X] T066 [US7] Add inquiry seed data + handlers in `src/mocks/mockApi.js` using a replaceable seed shape (dev-only)
- [X] T067 [US7] Create InquiriesPage `src/pages/InquiriesPage/InquiriesPage.jsx`: list + detail view (tenant info, property info, message, date/time, status when provided) (FR-028)
- [X] T068 [US7] Wire routes in `src/App.jsx`: `/inquiries`, `/inquiries/:inquiryId`

**Checkpoint**: US7 independently testable.

---

## Phase 8: User Story 6 - Viewing Request Management (Priority: P2) 📅

**Goal**: Administrator views viewing requests and updates statuses (Confirm, Reject, Mark completed, Cancellation) where authorized by the backend contract.
**Independent Test**: Open Viewing Requests → list renders; open details (viewingId, userId, propertyId, userName, userPhone, date, time, message, status, createdAt); change Pending → Confirmed → UI reflects change; forbidden transition surfaces backend response.

### Tests for User Story 8

- [X] T069 [P] [US6] Component test: `tests/component/viewingRequests.test.jsx` — status update success feedback and forbidden-transition surfacing (FR-032)

### Implementation for User Story 8

- [X] T070 [US6] Create `src/services/viewingRequestService.js`: list, get, updateStatus (INTEGRATION: backend status transitions PENDING — FR-032)
- [X] T071 [US6] Add viewing request seed data + handlers in `src/mocks/mockApi.js` with statuses Pending/Confirmed/Rejected/Cancelled/Completed (FR-031)
- [X] T072 [US6] Create ViewingRequestsPage `src/pages/ViewingRequestsPage/ViewingRequestsPage.jsx`: list + detail (tenant, property, requested date/time, message, status) (FR-030)
- [X] T073 [US6] Add status action controls (Confirm, Reject, Mark completed, Cancellation) respecting allowed transitions (FR-031, FR-032)
- [X] T074 [US6] Wire routes in `src/App.jsx`: `/viewing-requests`, `/viewing-requests/:viewingId`

**Checkpoint**: US6 independently testable.

---

## Phase 9: User Story 8 - User Management (Priority: P3) 👥

**Goal**: Administrator views user list and details (userId, name, email, phone, authentication info, favorites) with search where supported; read-mostly, no backend logic.
**Independent Test**: Open Users → list renders from mock; open user details; search/filter where supported; empty/error states work.

### Tests for User Story 9

- [X] T075 [P] [US8] Component test: `tests/component/users.test.jsx` — list + detail render, empty and error states (FR-033–FR-035)

### Implementation for User Story 9

- [X] T076 [US8] Create `src/services/userService.js`: list({search}), get (INTEGRATION: backend user endpoints PENDING — read-mostly)
- [X] T077 [US8] Add user seed data + handlers in `src/mocks/mockApi.js` (userId, name, email, phone, auth info, favorites) (dev-only)
- [X] T078 [US8] Create UsersPage `src/pages/UsersPage/UsersPage.jsx`: list + detail view, search/filter where supported (FR-033, FR-034)
- [X] T079 [US8] Wire routes in `src/App.jsx`: `/users`, `/users/:userId`

**Checkpoint**: US8 independently testable.

---

## Phase 10: Polish & Cross-Cutting Concerns (Testing & Integration Verification)

**Purpose**: Hardening, full test coverage, and verification that the panel meets the spec's success criteria and constitution (SC-001…SC-008).

- [X] T080 [P] Unit tests: `tests/unit/validators.test.js`, `tests/unit/format.test.js` (FR-018, FR-040)
- [X] T081 [P] Unit tests: `tests/unit/services.test.js` — auth, property, dashboard, viewing, user, inquiry, ai services against the mock (service-layer contract isolation)
- [X] T082 [P] Unit tests: `tests/unit/auth.test.jsx` — AuthContext + ProtectedRoute behavior (FR-003, FR-004, FR-006)
- [X] T083 [P] Accessibility pass: semantic labels, aria states, keyboard operability on forms/buttons/nav/modals (FR-046)
- [X] T084 [P] Responsive pass on desktop/tablet: no horizontal scrolling on primary screens; sidebar collapse behavior (FR-010, FR-046, SC-006)
- [X] T085 Verify loading/empty/error/success/validation states across list, detail, form, and action flows (FR-036–FR-041, SC-005)
- [X] T086 Run full suite `npm test` + `npm run test:e2e`; fix failures until green
- [X] T087 Run the quickstart smoke test from `specs/001-admin-panel/quickstart.md` on `http://localhost:3000` (boot, mock login, property CRUD, AI generate/edit/save, status change)
- [X] T088 Verify SC-007: no hardcoded production stats/credentials/tokens; no invented permanent contracts; mocks isolated behind `VITE_USE_MOCKS`
- [X] T089 Final traceability review: every task maps to a spec FR/SC and a plan component; update `quickstart.md` if behavior drifted; no out-of-scope code (tenant/mobile/backend/AI-model/deployment)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundation (Phase 1)**: No dependencies — can start immediately; MUST complete before any user story.
- **US1 Auth (Phase 2)**: Depends on Phase 1 — blocks all other stories (login + protected layout).
- **US2 Dashboard (Phase 3)**: Depends on US1 — can run in parallel with US3.
- **US3 Properties (Phase 4)**: Depends on US1 — can run in parallel with US2.
- **US5 AI Content (Phase 5)**: Depends on US3 (property form + propertyService.update) — sequential after US3.
- **US4 Approval/Publishing (Phase 6)**: Depends on US3 (propertyService + statuses) — sequential after US3.
- **US7 Inquiries (Phase 7)**: Depends on US1 — can run in parallel with US2/US3/US6/US8.
- **US6 Viewing Requests (Phase 8)**: Depends on US1 — can run in parallel with US2/US3/US7/US8.
- **US8 Users (Phase 9)**: Depends on US1 — can run in parallel with US2/US3/US7/US6.
- **Polish & Verification (Phase 10)**: Depends on all desired user stories.

### User Story Dependencies

- **US1 (P1)**: After Phase 1 — no other story dependencies.
- **US2 (P1)**: After US1 — independent of US3+.
- **US3 (P1)**: After US1 — independent of US2.
- **US4 (P1)**: After US3 — depends on US3's propertyService and status handling.
- **US5 (P2)**: After US3 — depends on US3's property form and propertyService.
- **US6 (P2)**: After US1 — independent of other stories.
- **US7 (P2)**: After US1 — independent of other stories.
- **US8 (P3)**: After US1 — independent of other stories.

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation (red first).
- Services before pages; pages before route wiring.
- Story complete before moving to the next sequential story.

### Parallel Opportunities

- All Phase 1 tasks marked [P] can run in parallel (within Setup and within Foundational).
- Once US1 completes, US2, US3, US6, US7, US8 can proceed in parallel (different pages/services/files).
- US5 and US4 run after US3 and are sequential to each other only if staffed by one implementer; otherwise independent.
- All per-story [P] test tasks can run in parallel with each other and before that story's implementation.

---

## Parallel Example: Phase 1 (Foundation)

```bash
Task: "T003 [P] Install and configure Tailwind CSS in tailwind.config.js"
Task: "T004 [P] Add dependencies to package.json"
Task: "T013 [P] Create mock backend src/mocks/mockApi.js"
Task: "T014 [P] Create mock seed data src/mocks/mockData.js"
```

## Parallel Example: User Story 1

```bash
Task: "T027 [P] [US1] Component test tests/component/login.test.jsx"
Task: "T028 [P] [US1] E2E test tests/e2e/auth.spec.js"
Task: "T029 [US1] Create AuthContext src/context/AuthContext.jsx"
Task: "T034 [P] [US1] Create Sidebar src/components/layout/Sidebar.jsx"
Task: "T035 [P] [US1] Create Header src/components/layout/Header.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup & Foundation.
2. Complete Phase 2: US1 Auth + Protected Layout.
3. **STOP and VALIDATE**: Test US1 independently (T027, T028 green).
4. Demo: login → dashboard shell on `http://localhost:3000`.

### Incremental Delivery

1. Phase 1 → Phase 2 (US1) → deploy/demo (MVP).
2. Add US2 Dashboard → test → demo.
3. Add US3 Properties → test → demo.
4. Add US5 AI Content and US4 Approval/Publishing → test → demo.
5. Add US7 Inquiries, US6 Viewing Requests, US8 Users → test → demo.
6. Phase 10 Polish & Verification → full suite green.

### Parallel Team Strategy

1. Team completes Phase 1 together.
2. Once US1 is done: Developer A (Dashboard), Developer B (Properties), Developer C (Inquiries), Developer D (Viewing Requests).
3. Then: Developer A (AI content), Developer B (Approval/Publishing), Developer C (Users).
4. Phase 10 verification shared by all.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to user story for traceability; phases 2–9 are story-owned.
- `(INTEGRATION: … PENDING)` tasks build frontend boundaries/mocks only — no permanent backend/AI contracts; replace adapters when contracts land (Mohammad Arsalan, Sanaullah).
- Do NOT create tasks for backend, database, AI-model, tenant-site, mobile, deployment, or git workflows — out of scope.
- Tests for each story MUST fail before implementation (red first).
- Commit after each task or logical group.
- Stop at any checkpoint to validate the story independently.
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence.

## Notes

### SettingsPage (in-scope addition, not a numbered task)

`SettingsPage` (`src/pages/SettingsPage/SettingsPage.jsx`) is part of the Admin
Panel scope: it shows the authenticated admin's account information and a
change-password form backed by `authService.changePassword` (behind the mock
abstraction, pending the backend auth contract). It is covered by
`tests/component/settings.test.jsx` and `tests/e2e/settings.spec.js`. The
exact password policy follows the backend authentication contract (spec
dependency #1); no unrelated requirements were invented.
