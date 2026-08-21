# AI Integration Guide (Backend Boundary)

**Feature**: ai-integration | **Branch**: `feature/ai-integration` | **Owner**: Sanaullah (AI)
**Scope**: This document defines how the Backend consumes the `ai/` module. It is documentation only — no Backend files are created or modified here.

---

## 1. Architecture

```text
Web / Mobile / Admin  →  Backend (Express — owns HTTP, auth, validation, rate limits)
                              │  calls an in-process module
                              ▼
                   AiService facade  (ai/ package: @property-rental/ai)
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
              MockProvider          LiveProvider
            (deterministic,        (OpenAI-compatible
             AI_MODE=mock)         Chat Completions, AI_MODE=live)
```

- **Backend is the sole caller** of `ai/`. Web/Mobile/Admin never talk to the AI provider or to `ai/` directly (README §1, §12).
- `ai/` is a self-contained library. It contains **no Express, no MongoDB, no HTTP server, and no database code**. It performs zero storage writes.
- The only coupling between Backend and `ai/` is the `AiService` facade: `generateContent(raw)`, `answerQuestion(property, question)`, `scoreLead(context)`, created by `createAiService(config)`.
- Results are frozen plain objects; failures are thrown as `AiError` (typed) or `TypeError` (programmer error on inputs).

## 2. Usage — `createAiService()`

Package entry (`ai/package.json` → `"main": "src/index.js"`, CommonJS):

```js
const { createAiService } = require('@property-rental/ai');
```

`createAiService(options?)` accepts one of:

1. **Nothing** → reads `process.env` (typical production start).
2. **An env-shaped object** of `AI_*` string keys (e.g., `{ AI_MODE: 'mock' }`).
3. **A resolved config object** with camelCase keys (see §5).

```js
// Mock mode — no key, deterministic, offline (default)
const service = createAiService({ AI_MODE: 'mock' });

// Live mode — reads AI_API_KEY / AI_BASE_URL from process.env
const service = createAiService();

// Live mode with an explicit env object
const service = createAiService({
  AI_MODE: 'live',
  AI_API_KEY: process.env.AI_API_KEY,
  AI_BASE_URL: 'https://api.openai.com/v1',
});
```

## 3. The Three Capabilities

### 3.1 Content generation — `generateContent(raw)`

```js
const content = await service.generateContent({
  propertyType: 'apartment',
  price: 50000,
  location: 'DHA Karachi',
  bedrooms: 2,
  bathrooms: 2,
  amenities: ['parking', 'wifi'],
  furnished: true,
  notes: 'Near the main boulevard, quiet street.',
});
// → { title: '2-Bedroom Apartment in DHA Karachi', description: '...' }
```

- Input fields are the shared README property fields (a subset of `RawPropertyInput`).
- Returns a frozen `{ title, description }` (title ≤ `AI_MAX_TITLE_LENGTH`, description ≤ `AI_MAX_DESCRIPTION_LENGTH`).
- Admin-facing: the returned copy is a **suggestion**; the Backend/Admin decides when to persist. Nothing is auto-saved.
- One retry on malformed output (`INVALID_OUTPUT`) happens inside the facade.

### 3.2 Property-specific stateless chatbot — `answerQuestion(property, question)`

```js
const { answer } = await service.answerQuestion(
  {
    propertyId: 'prop_123',
    title: 'Modern 2-Bed Apartment in DHA Karachi',
    description: 'A bright, furnished 2-bedroom apartment.',
    propertyType: 'apartment',
    price: 50000,
    location: 'DHA Karachi',
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['parking', 'wifi'],
    furnished: true,
    availability: true,
    status: 'published',
  },
  'Is the property pet friendly?'
);
// → { answer: 'According to this listing, ...' }
```

- The Backend **loads the property and injects its context on every request**; the tenant never names the property (README §7).
- `question` must be a non-empty string ≤ `AI_MAX_QUESTION_LENGTH` (default 500). Longer/blank questions throw `TypeError` (map to `400`).
- **Stateless and single-turn**: no conversation memory, no chat database, no writes. Multi-turn, if ever wanted, must be replayed client-side in the request body — still never stored server-side.

### 3.3 Lead scoring — `scoreLead(context)`

```js
const { score, summary } = await service.scoreLead({
  userName: 'Ali',
  message: 'I am very interested and would like to schedule a visit.',
  date: '2026-08-20',
  time: '17:00',
  favoritesCount: 4,
  priorViewingCount: 2,
});
// → { score: 90 }  (integer 0–100, optionally a summary string)
```

- Signals (D2): viewing-request completeness (date/time/message), contact completeness, favorites count, prior viewing requests.
- Returns a frozen `{ score, summary? }`; `score` is clamped/rounded to an integer 0–100.
- PII-minimized: names and phone numbers are **never** included in prompt text (only a `Profile completeness` boolean signal).
- **Persistence is NOT implemented in `ai/`.** See §10.

## 4. Provider Modes

| `AI_MODE` | Provider | Requires key | Behavior |
|-----------|----------|--------------|----------|
| `mock` (default) | `MockProvider` | No | Deterministic template title/description, keyword-based chat answers, heuristic 0–100 lead score. Fully offline; ideal for dev/CI. |
| `live` | `LiveProvider` | Yes (`AI_API_KEY`) | OpenAI-compatible Chat Completions via global `fetch` to `AI_BASE_URL`, `AI_TIMEOUT_MS` timeout, one retry on transient failures. |

- If `AI_MODE=live` without `AI_API_KEY`, `createAiService` throws `AiError('CONFIG_MISSING')`.
- Switching modes is **config-only**; no Backend code changes.

## 5. Environment Variables

Loaded by `ai/src/config.js` from `AI_*` keys. Empty values fall back to the defaults below.

| Variable | Purpose | Default |
|----------|---------|---------|
| `AI_MODE` | `mock` or `live` | `mock` |
| `AI_API_KEY` | Provider API key (**required** when `AI_MODE=live`) | *(none)* |
| `AI_BASE_URL` | OpenAI-compatible base URL (e.g., `https://api.openai.com/v1`) | *(provider default)* |
| `AI_MODEL` | Model identifier | `gpt-4o-mini` |
| `AI_TIMEOUT_MS` | Per provider-call timeout | `30000` |
| `AI_MAX_TOKENS` | Max completion tokens per call | `800` |
| `AI_MAX_TITLE_LENGTH` | Generated title cap | `120` |
| `AI_MAX_DESCRIPTION_LENGTH` | Generated description cap | `1000` |
| `AI_MAX_QUESTION_LENGTH` | Chat question cap (enforced by the facade) | `500` |
| `AI_MAX_ANSWER_LENGTH` | Chat answer cap (enforced by the facade) | `1000` |
| `AI_CHAT_RATE_LIMIT` | **Hint** for Backend chat rate limit (not enforced by `ai/`) | `20` |
| `AI_CHAT_RATE_WINDOW_MS` | **Hint** for Backend rate-limit window (not enforced by `ai/`) | `60000` |

> Integer env vars are parsed strictly (digits only). Secrets come from env only — never commit `.env`; `ai/.env.example` is the committed reference.

## 6. Errors and HTTP Mapping

All library failures are `AiError` (`err.code`), imported via:

```js
const { AiError, isAiError } = require('@property-rental/ai'); // not exported — see note below
```

> Note: the public entry currently exports only `createAiService`. `AiError` / `isAiError` live in `ai/src/errors.js`; if the Backend needs them for mapping, either import `ai/src/errors.js` directly (await the AI feature to export them from `src/index.js` if preferred) or map using the `code` property of caught errors.

`AiError` shape: `{ name: 'AiError', code, message, cause?, providerStatus?, retryable? }`.

| Code | Meaning | Recommended HTTP | Client message |
|------|---------|------------------|----------------|
| `CONFIG_MISSING` | `AI_MODE=live` without `AI_API_KEY`, or invalid `AI_*` value | `500` (server misconfiguration) | "AI service is not configured" |
| `PROVIDER_AUTH` | Provider rejected the API key (401/403) | `502` | "AI service unavailable, try again" |
| `PROVIDER_TIMEOUT` | Provider call timed out | `502` (or `503`) | "AI service unavailable, try again" |
| `PROVIDER_UNAVAILABLE` | Provider 429/5xx/network failure | `502`/`503` | "AI service unavailable, try again" |
| `INVALID_OUTPUT` | Malformed/unparseable/missing output | `502` | "Could not generate content" |
| `TypeError` (not `AiError`) | Bad facade input (missing property, blank/over-long question, missing context) | `400` | Field-specific validation message |

- `retryable === true` marks transient failures (timeout/429/5xx); the live provider already retries once internally. Do **not** retry `PROVIDER_AUTH` or `CONFIG_MISSING`.
- Never surface raw provider errors, keys, or full prompts to clients or logs. Log only coarse fields (`ai.feature`, `ai.status`, `ai.latencyMs`, `ai.errorCode`).

## 7. Backend Route Skeletons (pseudocode — Backend-owned)

These are **proposals** to be finalized with the Backend owner (README §23: "The Backend defines the API structure"). Nothing here is an implementation.

```js
// POST /api/admin/ai/generate-content   (admin auth only)
async function generateContentHandler(req, res) {
  try {
    const content = await aiService.generateContent(req.body); // RawPropertyInput
    res.json(content); // { title, description }
  } catch (err) {
    mapAiError(res, err);
  }
}

// POST /api/ai/chat                     (logged-in tenant auth, rate limited)
async function chatHandler(req, res) {
  const property = await loadProperty(req.body.propertyId); // Backend: Mongo lookup
  if (!property) return res.status(404).json({ message: 'Property not found' });
  const context = toPropertyContext(property); // Backend builds PropertyContext
  try {
    const { answer } = await aiService.answerQuestion(context, req.body.question);
    res.json({ answer }); // NO database write (FR-010)
  } catch (err) {
    mapAiError(res, err);
  }
}

// GET /api/admin/viewings?leadScore=true (admin auth)
// Option A (after lead-score approval): read persisted leadScore
// Option B (fallback, compute-on-demand): call aiService.scoreLead(context)
async function viewingsHandler(req, res) {
  const viewings = await loadViewings();
  const withScores = await Promise.all(viewings.map(async (v) => {
    const { score } = await aiService.scoreLead(toLeadContext(v, req.user));
    return { ...v, leadScore: score };
  }));
  res.json(withScores);
}

function mapAiError(res, err) {
  if (err instanceof TypeError) return res.status(400).json({ message: err.message });
  // map AiError.code → HTTP per §6; default 500
}
```

## 8. Authentication

- **Chatbot**: requires a **logged-in tenant** (decision D5). The Backend authenticates via its existing auth (`JWT_SECRET`), before calling the facade.
- **Content generation & lead scoring**: admin-only (auth + role check), enforced by the Backend.
- **`ai/` implements no authentication and no authorization.** It trusts the caller. All auth lives in the Backend/API layer.

## 9. Rate Limiting / Cost Control

- Rate limiting is a **Backend/API-layer responsibility** — `ai/` does not enforce it.
- `AI_CHAT_RATE_LIMIT` (default 20) and `AI_CHAT_RATE_WINDOW_MS` (default 60000) are config **hints** the Backend can read to configure its rate-limiter for `POST /api/ai/chat` (per user, optionally per IP).
- Cost controls available to the Backend: chat rate limit, admin-only generation, and `AI_MAX_TOKENS` / `AI_TIMEOUT_MS` caps.

## 10. Lead-Score Persistence

- Current `ai/` behavior: `scoreLead(context)` only **computes and returns** `{ score, summary? }`. It writes nothing.
- Persisting `leadScore` on `viewingRequests` is a **proposal** — see `docs/proposals/lead-score-persistence.md` and ADR-3.
- The schema change applies **only after Backend-owner approval**. Until then, the Admin UI uses the **compute-on-demand fallback** (§7, `viewingsHandler` option B).

## 11. MockProvider for Development and Tests

- `AI_MODE=mock` (default) → `MockProvider`: deterministic, offline, no key, no network. Ideal for local dev, CI, and Backend integration tests (supertest with `AI_MODE=mock`).
- Mock outputs pass through the **same validators and error paths** as live, so the full contract is exercised without a key.
- All 135 `ai/` tests run in mock mode and require no API key.

## 12. Backend Integration Checklist

- [ ] `createAiService()` called once at Backend startup (env-driven; `AI_MODE` selects provider).
- [ ] Web/Mobile/Admin never import `ai/` or call the AI provider directly.
- [ ] `POST /api/admin/ai/generate-content` — admin auth; returns `{ title, description }`; does not auto-persist.
- [ ] `POST /api/ai/chat` — tenant auth; loads property by `propertyId`; builds `PropertyContext`; passes context + question to `answerQuestion`; returns `{ answer }`; performs **zero** DB writes.
- [ ] Chat endpoint rate-limited (per user) using `AI_CHAT_RATE_LIMIT`/`AI_CHAT_RATE_WINDOW_MS`.
- [ ] `AiError.code` mapped to HTTP per §6; `TypeError` mapped to 400; no raw errors/keys/prompts leaked.
- [ ] Lead score exposed via `scoreLead` (compute-on-demand) until the `leadScore` persistence proposal is approved.
- [ ] Integration tests run with `AI_MODE=mock` (no API key in CI).
- [ ] `.env` stays out of git; config uses only the `AI_*` variables in §5.
