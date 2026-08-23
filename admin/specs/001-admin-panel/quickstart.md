# Quickstart: Property Rental Admin Panel

**Branch**: `001-admin-panel` | **Date**: 2026-08-13

## Prerequisites

- Node.js 20+ and npm
- Git branch `001-admin-panel`

## Install

```bash
npm install
```

## Environment

Copy `.env.example` to `.env` and set:

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API base URL (used when mocks are off) | `http://localhost:8000/api` |
| `VITE_USE_MOCKS` | `true` = run against in-memory mock backend | `true` |

> Mocks are ON by default because backend/AI contracts are pending. Set
> `VITE_USE_MOCKS=false` only when real endpoints are available. Never commit
> secrets or real credentials to `.env` files that reach Git (FR-047).

## Run (development)

```bash
npm run dev
```

Open the printed URL, then log in with the mock admin credentials shown in
`src/mocks/mockData.js` (development only).

## Build

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test              # Vitest unit + component tests (watch)
npm run test:unit     # Vitest run once
npm run test:e2e      # Playwright end-to-end suite
```

## Verify the quickstart (acceptance smoke test)

1. `npm install` completes without errors.
2. `npm run dev` boots and `/login` renders.
3. With mocks on, log in → Dashboard shows six summary stats.
4. Create a property → it appears in the list → open details → edit → delete
   (with confirmation).
5. On a property, generate AI title/description → review → edit → save.
6. `npm test` passes (unit + component) and `npm run test:e2e` passes.
