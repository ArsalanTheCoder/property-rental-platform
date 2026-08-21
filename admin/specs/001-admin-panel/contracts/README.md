# API Contracts: Property Rental Admin Panel

**Branch**: `001-admin-panel` | **Date**: 2026-08-13

## Contract Status

Wire-level contracts (endpoints, payloads, authentication, error format) are
**PENDING** and owned by:

- **Backend (Mohammad Arsalan)**: all REST endpoints, auth, error format —
  spec Integration Dependencies #1–#6, #8, #9.
- **AI (Sanaullah)**: generation request/response schema — dependency #7.

Until these land, the Admin Panel develops against an **isolated configurable
mock** (`src/mocks/mockApi.js`), switched via `VITE_USE_MOCKS`. The domain
interfaces below are the Admin Panel's *consumption contract* and MUST NOT be
renamed to match an unconfirmed backend; the real adapters map backend wire
shapes onto these interfaces. No permanent contract is invented here.

## Conventions

- Base URL: `VITE_API_BASE_URL` (env-driven).
- Auth: token attached by `src/api/http.js` interceptor; exact header/scheme
  pending (dependency #1).
- Errors: normalized to `ApiError { status, message, fields? }` by the HTTP
  layer; exact backend error shape pending.

## AuthService

| Operation | Interface | Status |
|-----------|-----------|--------|
| login(emailOrUsername, password) | Promise<{ token, admin }> | PENDING (dependency #1) |
| logout() | Promise<void> | PENDING |
| getSession() | Promise<{ token, admin } \| null> | PENDING |
| changePassword(currentPassword, newPassword) | Promise<{ success }> | PENDING (dependency #1) |

## PropertyService

| Operation | Interface | Status |
|-----------|-----------|--------|
| list({ search, filters }) | Promise<Property[]> | PENDING |
| get(propertyId) | Promise<Property> | PENDING |
| create(data) | Promise<Property> | PENDING |
| update(propertyId, data) | Promise<Property> | PENDING |
| remove(propertyId) | Promise<void> | PENDING |
| review(propertyId) | Promise<Property> | PENDING (dependency #2) |
| approve(propertyId) | Promise<Property> | PENDING (dependency #2) |
| publish(propertyId) | Promise<Property> | PENDING (dependency #2) |

**Property shape**: propertyId, title, description, propertyType, price,
location, bedrooms, bathrooms, amenities, furnished, images, availability,
status (verbatim; FR-045).

## InquiryService

| Operation | Interface | Status |
|-----------|-----------|--------|
| list() | Promise<Inquiry[]> | PENDING (dependency #4) |
| get(inquiryId) | Promise<Inquiry> | PENDING (dependency #4) |

No mutation operations are planned until the backend provides them (FR-029).

## ViewingRequestService

| Operation | Interface | Status |
|-----------|-----------|--------|
| list() | Promise<ViewingRequest[]> | PENDING |
| get(viewingId) | Promise<ViewingRequest> | PENDING |
| updateStatus(viewingId, status) | Promise<ViewingRequest> | PENDING (dependency #5) |

Statuses: Pending, Confirmed, Rejected, Cancelled, Completed (FR-031).

## UserService

| Operation | Interface | Status |
|-----------|-----------|--------|
| list({ search }) | Promise<User[]> | PENDING |
| get(userId) | Promise<User> | PENDING |

## AiService (separate boundary — owner: Sanaullah)

| Operation | Interface | Status |
|-----------|-----------|--------|
| generatePropertyContent(input) | Promise<{ title, description }> | PENDING (dependency #7) |

**Conceptual input** (FR-024): structured property information available in
the form — propertyType, price, location, bedrooms, bathrooms, amenities,
furnished, availability, raw notes/information. The exact request/response
schema is NOT defined here; it belongs to Sanaullah.

**Boundary rule**: AI-generated content is displayed for review/editing only;
it is never stored as production data without an explicit admin save (FR-027).
