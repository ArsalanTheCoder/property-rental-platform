# Property Rental Platform - Mobile App

Tenant-facing mobile application for the Property Rental Platform. Built with React Native and Expo Router, this app lets tenants browse listings, search and filter properties, save favorites, ask the property AI chatbot questions, and request property viewings.

This repository contains the mobile app portion of the larger Property Rental Platform project. It is wired directly to the real backend described in `backend/AGENTS.md`, RFC-001-B (authentication), RFC-002-B (admin and property schema), and RFC-003-B (tenant-facing endpoints). There is no mock or demo data in this app; every screen calls the live API.

## Screenshots

| Home | Search | Property Details |
|------|--------|-------------------|
| ![Home](docs/screenshots/home.png) | ![Search](docs/screenshots/search.png) | ![Details](docs/screenshots/details.png) |

| Favorites | Bookings | Profile |
|-----------|----------|---------|
| ![Favorites](docs/screenshots/favorites.png) | ![Bookings](docs/screenshots/bookings.png) | ![Profile](docs/screenshots/profile.png) |

## Tech stack

- React Native (0.81) with the New Architecture enabled
- Expo SDK 54
- Expo Router for file based navigation
- TypeScript
- React Context for auth and favorites state
- Feather icons via @expo/vector-icons

## Getting started

Requirements: Node.js 18 or later, the backend running locally or deployed, and the Expo Go app on a physical device, or an Android/iOS simulator.

```
npm install
npx expo install --fix
npx expo start
```

Scan the QR code with Expo Go on Android, or the Camera app on iOS. Press `a` for an Android emulator, `i` for an iOS simulator, or `w` to run in a browser.

## Connecting to the backend

Open `src/api/config.ts` and set `BASE_URL` to wherever the backend is running, including the `/api/v1` prefix:

```ts
export const BASE_URL = "http://your ip address/api/v1";
```

Use your machine's local network IP, not `localhost`, when testing on a physical device with Expo Go, since the phone and the backend are different devices on the network. `localhost` only works when running in a simulator on the same machine as the backend, or in `npx expo start --web`.

Authentication uses httpOnly cookies (see RFC-001-B). Every request in `src/api` is sent with `credentials: "include"` so the cookies are attached automatically; there is nothing to configure beyond `BASE_URL`.

## Project structure

```
app/                      Expo Router screens, file based routing
  (auth)/                 Login, signup, verify email, forgot/reset password
  (tabs)/                 Home, Search, Favorites, Bookings, Profile
  property/[id]/          Property details, AI chat, viewing request

src/
  api/                    One file per resource, mapping backend "_id" documents to clean frontend types
  components/             Reusable UI components
  constants/theme.ts       Colors, spacing, and typography tokens
  context/                 Auth state and favorites state
  types/                   Shared TypeScript types matching the backend model
  utils/                   Formatting helpers

assets/                    App icon, adaptive icon, and splash screen images
docs/screenshots/          App screenshots used in this README
```

## Data model

Types in `src/types/index.ts` mirror the real backend contracts. Each file in `src/api` maps the backend's raw `_id`-based documents into the clean `id`-based types the UI uses, so nothing outside `src/api` ever needs to know about the backend's exact field names.

## Auth flow

Registration does not sign the user in. The backend requires a verified email before login succeeds (see RFC-001-B), so after signing up the app shows a Verify Email screen where the token from the verification email can be pasted in, with a resend option. Forgot Password and Reset Password follow the same token-paste pattern, since the backend only exposes `POST` verification endpoints, not clickable `GET` links, for security reasons.

## AI chatbot

Each property details screen has an "Ask AI about this" button that opens a chat screen backed by `POST /api/v1/properties/:id/chat`. Answers are grounded in that property's own listing details and are not stored by the backend, so chat history only exists for the current screen session.

## Design system

Colors, spacing, and typography are defined once in `src/constants/theme.ts`. Screens and components read from these tokens rather than hardcoding values, so visual changes can be made in a single place.

## My contribution

This mobile app was built end to end as my part of the team's Property Rental Platform project, covering the full tenant-facing experience:

- Authentication flow: signup, email verification, login, forgot password, and reset password, matching RFC-001-B exactly
- Home screen with featured listings
- Search with live filtering, and a filter sheet for property type, bedrooms, and price
- Property details screen with an image gallery, amenities, and availability status
- Property-specific AI chatbot and viewing request flows, each with their own confirmation screen
- Favorites, with optimistic UI updates and rollback on failure
- Bookings screen showing the status of every viewing request, with cancellation support
- Profile screen with account details and sign out
- A single design system (colors, spacing, typography) applied consistently across every screen
- An API layer that maps the backend's real contracts (RFC-001-B, RFC-002-B, RFC-003-B) into clean frontend types
- Custom animated splash screen, app icon, and adaptive icon

## Working with this repository

This mobile app lives inside the shared team repository. Development work happens on a feature branch, not directly on the main branch.

## Author

Farooque Sajjad 
Software Engineer, QA Automation

GitHub: https://github.com/Farooquekk
LinkedIn: https://www.linkedin.com/in/farooque-sajjad-233b41282/
