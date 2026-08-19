# Data Model: Property Rental Admin Panel

**Branch**: `001-admin-panel` | **Date**: 2026-08-13
**Input**: Key Entities and FRs from [spec.md](./spec.md)

Field names follow the shared data contracts exactly (FR-045). Types are the
shapes the Admin Panel renders/collects; wire-level serialization follows the
backend contract when confirmed.

## Property

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| propertyId | string (id) | yes | unique identifier |
| title | string | yes | min length 3; AI-generated or manual |
| description | string | yes | min length 20 |
| propertyType | string enum | yes | values per backend contract (dependency #3-adjacent); e.g. house/apartment/studio in mock |
| price | number | yes | >= 0 |
| location | string | yes | free text |
| bedrooms | integer | yes | >= 0 |
| bathrooms | integer | yes | >= 0 |
| amenities | string[] | no | list |
| furnished | boolean | yes | |
| images | string[] | no | URL list (URL-validated; upload deferred, dependency #9) |
| availability | string enum | yes | values per backend contract (dependency #3); mock seed only |
| status | string enum | yes | values per backend contract (dependency #2); NOT hardcoded; driven by `config/propertyWorkflow.js` |

**Validation** (FR-018, FR-040): title/description lengths, numeric price,
integer bedrooms/bathrooms, URL images, required enum fields.

**Lifecycle / state transitions** (FR-022, FR-023): the Admin Panel exposes
distinct **Review → Approve → Publish** actions. Exact status values and
allowed transitions come from the backend contract via the workflow config;
the frontend never hardcodes them.

## User

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| userId | string (id) | yes | |
| name | string | yes | |
| email | string | yes | email format |
| phone | string | no | |
| authentication information | object | yes* | shown read-only where provided; never secrets |
| favorites | string[] (propertyId refs) | no | displayed where supported |

Read-mostly entity (FR-033–FR-035); no mutation in the Admin Panel.

## ViewingRequest

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| viewingId | string (id) | yes | |
| userId | string (id) | yes | tenant reference |
| propertyId | string (id) | yes | property reference |
| userName | string | yes | |
| userPhone | string | no | |
| date | string (date) | yes | requested viewing date |
| time | string (time) | yes | requested viewing time |
| message | string | no | |
| status | string enum | yes | Pending / Confirmed / Rejected / Cancelled / Completed (FR-031) |
| createdAt | string (ISO datetime) | yes | |

**State transitions** (FR-032): Confirm / Reject / Mark completed /
Cancellation surfaced as actions; allowed transitions follow the backend
contract (dependency #5). The mock models a permissive Pending→{Confirmed,
Rejected, Cancelled}→Completed set for development.

## Inquiry (contract pending — dependency #4)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| inquiryId | string (id) | TBD | field names pending backend owner |
| tenant info | TBD | TBD | |
| property ref | TBD | TBD | |
| message | TBD | TBD | |
| date/time | TBD | TBD | |
| status | TBD | TBD | shown only when backend provides it |

The UI is built against a mock abstraction with a reasonable seed shape and
MUST be updated to the confirmed contract without inventing permanent fields
(FR-028, FR-029).

## Session / Auth (frontend-internal)

| Field | Type | Notes |
|-------|------|-------|
| token | string | in-memory + optional sessionStorage behind abstraction (pending dependency #1) |
| admin | { id, name, email } | derived from auth response; exact shape pending contract |

## Relationships

- **ViewingRequest.propertyId → Property.propertyId** (lookup for detail display)
- **ViewingRequest.userId → User.userId** (tenant info)
- **Inquiry → User/Property** (pending contract)
- **User.favorites → Property.propertyId[]** (display only)

## Consistency rules

- Shared field names preserved verbatim (FR-045): no renaming or silent
  transformation.
- Status/availability/type enumerations never hardcoded in components; always
  resolved through config/mock until backend contract confirmed.
