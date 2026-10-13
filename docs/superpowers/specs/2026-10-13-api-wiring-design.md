# API Wiring Design — StayEasy frontend ↔ ServerIQ API (`/api/v1`)

Date: 2026-10-13
Status: Approved for implementation
Backend spec source: `https://stay-easy-sizw.onrender.com/api/v1/openapi.json` (OpenAPI 3.1.0, 187 operations, 154 paths, `ServerIQ API v1.0.0`)

## 1. Context

The frontend (`StayEasy_SA`) makes 51 unique API calls in three areas:

1. **Auth pages** (Login/Signup/Forgot/Reset) — real API calls, mostly correct.
2. **Superadmin section** (25 routes) — 100% mock: fake login (`mock@serveiq.com` / `Admin@123` → `sa_` token), hardcoded zustand store, zero HTTP calls.
3. **Property wizard** (`HostPortalPageNew` + `CreateTenantWizard` + `portal/` steps) — real API calls, reachable from superadmin `TenantsPage` ("Create Tenant" button). Login navigates hosts to `/host/my-properties` and `/host/portal`, which do not exist as routes.

Backend has 187 endpoints. Auth roles supported: `USER` / `GUEST` only. There is **no superadmin login endpoint** and **no reset-password endpoint**.

## 2. Endpoint disposition

### 2.1 Keep as-is (38 calls, already valid)

Auth: `POST /auth/login`, `POST /auth/users|guests/register|verify-otp|resend-otp`, `POST /auth/forgot-password`, `POST /auth/users|guests/refresh`, `GET /auth/users|guests/me`.
Tenants: `GET/POST/PATCH/DELETE /tenants` (normalize trailing slash).
Properties: `GET /properties`, `GET/PATCH/DELETE /properties/{id}`, `GET /properties/amenities`, `POST /properties/{id}/toggle-property-activation`, `GET /properties/{id}/bookings` (normalize trailing slashes).
Rooms: full CRUD + `room-type(s)` / `bed-type(s)` / `available-rooms`.
Special-offers + discount-codes CRUD, bookings `GET /bookings/{ref}` / `POST /bookings/`.

### 2.2 Fix path (rewire to existing endpoint)

- `POST /properties/{propertyId}/images` → **`POST /properties/images`** (backend has no per-property variant; form field `files` and response shape `data: string[]` already match). Drop the `propertyId` argument.
- Normalize trailing slashes to spec: `/properties/`, `/tenants/`, `/special-offers/`, `/discount-codes/`.
- Guest login must append `?role=guest` to `POST /auth/login` (`Login.tsx`, `AuthContext.credentialLogin`); host login uses `?role=user`. The backend accepts role as an optional query param (frontend currently never sends it, so guests log in as users).

### 2.3 Rewire — consolidate onto `POST /properties`

The 5 wizard step-endpoints do not exist and are removed from the frontend:
`/properties/general-information`, `/properties/{id}/create-location`,
`/properties/{id}/create-photos-and-amenities`, `/properties/{id}/create-localization`,
`/properties/{id}/create-brand-visual`.

Replacement: one `POST /properties` with `CreatePropertyRequest =
{general_information, location, photos_and_amenities, localization, brand_visual}`.

New sequencing in `HostPortalPageNew.saveCurrentStep`: steps `type → property → location → photos → localization → branding` accumulate client-side (photo uploads via `/properties/images` need no property id); on leaving **branding**, fire `POST /properties` and store the returned id as `propertyId`; steps `rooms → pricing → review` run unchanged with a real id. Update `propertyId === null` guards and draft-restore handling accordingly.

Accepted limitation: photos/localization/brand sections cannot be re-persisted after creation (backend `PATCH /properties/{id}` only accepts general + location fields → `UpdatePropertyInfo`).

### 2.4 Remove — no backend endpoint

- Delete `src/pages/ResetPassword.tsx`, routes `/reset-password` and `/host/reset-password`, and any links pointing at them. `ForgotPassword` stays (endpoint exists; its success state already shows "check your email" without navigating to the reset page).

## 3. Host routes

- `/host/portal` → `HostPortalPageNew` wizard (redirect to `/host/login` when unauthenticated).
- `/host/my-properties` → **new** `MyPropertiesPage`: `GET /properties` list, "Create Property" opens `CreateTenantWizard`, include loading/empty states.
- `/` and wildcard `*` → role-aware redirect instead of `/superadmin/login`: superadmin → `/superadmin`; any other authenticated user → `/host/my-properties`; unauthenticated → `/login`.

## 4. Superadmin auth → real login

- `Login.tsx` superadmin branch: real `POST /auth/login` (form-encoded) → store `access_token`/`refresh_token` in the standard storage keys with `userType=superadmin`, `authRole=users` → verify with `GET /superadmin/me` (non-200 → "account is not a superadmin" error, clear storage) → navigate `/superadmin`.
- `SuperAdminRoute` checks the real token + `userType === 'superadmin'`; the 401 interceptor routes superadmins to `/superadmin/login` on refresh failure.
- **Delete `src/lib/superadmin-mock-auth.ts`** and all imports (mock credentials gone).

## 5. Superadmin pages — wire 8, keep rest mock

New service `src/services/superadminApi.ts` on the shared `api` axios instance (auth + refresh interceptor), unwrapping the `StandardResponse {success, data, meta}` envelope:

| Page | Endpoint(s) |
|---|---|
| Dashboard | `GET /superadmin/dashboard` |
| System Health | `GET /superadmin/health` |
| Plans | CRUD `GET/POST/PATCH/DELETE /superadmin/plans[/{plan_id}]` |
| Feature Flags | CRUD `/superadmin/feature-flags[/{flag_id}]` |
| Announcements | `GET/POST/DELETE /superadmin/announcements[/{announcement_id}]` |
| Admins & Roles | CRUD `/superadmin/admins[/{admin_id}]` (+ `/audit`, `/impersonate` only if the UI exposes them) |
| Audit Logs | `GET /superadmin/audit-logs` |
| Subscriptions | `GET /superadmin/plans` (plan catalog) only; per-tenant rows stay mock because **no superadmin tenant-list endpoint exists** |

Each wired page keeps its layout; only its data source changes to fetched state with loading/error/empty handling, refetching after mutations. The 14 remaining mock pages, `superAdminStore`, and sidebar contents are untouched.

## 6. Verification

- `npm run build` (tsc) + repo lint script pass.
- Grep audit for dead references: `reset-password`, `general-information`, `create-location`, `create-photos`, `create-localization`, `create-brand`, `superadmin-mock-auth`, `mockSuperAdminLogin`, `/properties/${propertyId}/images`.
- Manual smoke (needs a real backend account incl. a superadmin): guest/host signup → login → wizard creates a real property → property appears in `/host/my-properties`; superadmin login → dashboard plans load; mock pages still render.

## 7. Risks / known gaps

- Login response per spec is `{access_token, token_type}` with **no `refresh_token`**; if that holds at runtime, sessions degrade to re-login (interceptor already handles refresh failure gracefully).
- Superadmin wiring assumes a real admin account authenticates via `POST /auth/login`.
- No guest-facing UI exists; authed guests land on `/host/my-properties` like hosts.
- `SubscriptionsPage` and tenant-identity-dependent superadmin views stay partially/fully mock (no tenant-list endpoint).
