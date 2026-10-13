# API Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the StayEasy_SA frontend to the live ServerIQ API (`/api/v1`, 187 endpoints) and remove frontend code whose endpoints don't exist.

**Architecture:** Keep all UI/layout untouched; swap data sources only. New `superadminApi.ts` service + `useQuery`/`useMutation` (provider already in `main.tsx`) for 8 superadmin pages; single `POST /properties` replaces 5 dead wizard endpoints; real login replaces mock superadmin auth; new host routes expose the wizard.

**Tech Stack:** React 18 + TS + react-router 7, axios (`src/api.ts`), @tanstack/react-query 5, zustand (mock pages only), tailwind.

## Global Constraints

- API base URL is `import.meta.env.VITE_API_BASE_URL || 'https://stay-easy-sizw.onrender.com/api/v1'` — never hardcode hosts or the `/api/v1` prefix.
- All HTTP goes through the shared axios instance in `src/api.ts` (Bearer header + 401-refresh interceptor live there).
- Backend envelope is `StandardResponse { success: boolean; data: T; meta? }` — always unwrap `.data`.
- Copy backend field names EXACTLY from the OpenAPI schemas (source of truth: `C:\Users\Acer\.local\share\opencode\tool-output\tool_134235c0c001hRYE9kZoE4PLvM`, a saved copy of `/api/v1/openapi.json`). Never invent field names.
- No new dependencies. No backend changes. No UI/layout redesigns — data source swaps only.
- `tsc -b` and `eslint` must pass. No test framework exists in this repo; verification = eslint on touched files per task + full build/lint/grep audit at the end.
- Workers DO NOT run `git add/commit/push` (parallel index races). Report touched files; the orchestrator commits.
- File ownership is exclusive per task (see **Files**). `src/services/superadminApi.ts` is owned by Task 2 only — other tasks must not edit it (define any missing helper locally in the page and flag it).

---

## File structure

- Delete: `src/pages/ResetPassword.tsx`, `src/lib/superadmin-mock-auth.ts`
- Create: `src/services/superadminApi.ts` (T2), `src/components/RootRedirect.tsx` (T1), `src/pages/host/MyPropertiesPage.tsx` (T3, default export `MyPropertiesPage`)
- Modify: `src/App.tsx` (T1 owns ALL route edits), `src/pages/Login.tsx` (T1), `src/context/AuthContext.tsx` (T1), `src/api.ts` (T1), `src/components/SuperAdminRoute.tsx` (T1), `src/components/superadmin/superAdminStore.ts` — login fn + mock-auth import only (T1), `src/services/pmsApi.ts` (T3), `src/pages/HostPortalPageNew.tsx` (T3), 8 superadmin pages (T4–T6).

---

### Task 1: Auth, shell routes, kill mock auth + ResetPassword

**Files:**
- Modify: `src/App.tsx`, `src/pages/Login.tsx`, `src/context/AuthContext.tsx`, `src/api.ts`, `src/components/SuperAdminRoute.tsx`, `src/components/superadmin/superAdminStore.ts` (login fn + remove `../../lib/superadmin-mock-auth` import only — do NOT touch other store state; mock pages still use it)
- Create: `src/components/RootRedirect.tsx` (default export, no props)
- Delete: `src/pages/ResetPassword.tsx`, `src/lib/superadmin-mock-auth.ts`

**Interfaces:**
- Consumes: `POST /auth/login` (form `username/password`, query `?role=user|guest`), `GET /superadmin/me`
- Produces: real-token auth for the whole app; routes `/host/portal` → `HostPortalPageNew`, `/host/my-properties` → `MyPropertiesPage` (created in Task 3 — import it; exact default-export name `MyPropertiesPage`), `/` and `*` → `RootRedirect`

- [ ] **Step 1: `POST /auth/login` carries the role query param.** In `src/pages/Login.tsx` (direct `api.post('/auth/login', ...)`) and `src/context/AuthContext.tsx` `credentialLogin`, append `?role=user` for host logins and `?role=guest` for guest logins. (`Login.tsx` decides host vs guest from the pathname; keep that logic.)
- [ ] **Step 2: Real superadmin login.** In `Login.tsx`, replace the `isSuperAdmin` branch body (`await superAdminLogin(...)`) with: form-encoded `POST /auth/login` (same shape as host login) → persist `access_token` (+ `refresh_token` if present) via the existing auth-storage helpers with `authRole='users'`, `userType='superadmin'` (write BOTH the `api.ts` keys `token`/`refreshToken` AND the legacy `superAdminToken` key so `SuperAdminRoute` keeps working) → `GET /superadmin/me` to verify (non-2xx → clear auth, show "This account is not a superadmin") → `navigate('/superadmin')`. Remove the mock-credential hint UI if the login page shows demo creds.
- [ ] **Step 3: Rewire store login, delete mock auth.** In `superAdminStore.ts`, replace the `login` action body with the same real-login sequence (keep its signature `(email, password, rememberMe)` and its thrown-`Error` contract used by `Login.tsx`). Remove the `mockSuperAdminLogin`/`saveCredentials` import. Delete `src/lib/superadmin-mock-auth.ts`. Confirm no other file imports it.
- [ ] **Step 4: Interceptor + route guard.** In `src/api.ts` 401-handler, superadmins (`userType==='superadmin'`) redirect to `/superadmin/login` instead of silently staying. `SuperAdminRoute.tsx` stays as-is (reads `superAdminToken` + `userType`).
- [ ] **Step 5: Routes + RootRedirect.** Create `src/components/RootRedirect.tsx`: reads stored auth (`token` + `userType`/`authRole` from localStorage or sessionStorage); superadmin → `<Navigate to="/superadmin" replace />`; any other token → `<Navigate to="/host/my-properties" replace />`; none → `<Navigate to="/login" replace />`. In `App.tsx`: delete `ResetPassword` import + `/reset-password` + `/host/reset-password` routes; add `/host/portal` → `HostPortalPageNew`, `/host/my-properties` → `MyPropertiesPage`; replace wildcard `*` with `<RootRedirect />` and add `/` → `<RootRedirect />`.
- [ ] **Step 6: Delete `src/pages/ResetPassword.tsx`.**
- [ ] **Step 7: Verify.** Run: `npx eslint src/App.tsx src/pages/Login.tsx src/context/AuthContext.tsx src/api.ts src/components/SuperAdminRoute.tsx src/components/RootRedirect.tsx src/components/superadmin/superAdminStore.ts` — Expected: clean. Grep `ResetPassword|reset-password|superadmin-mock-auth|mockSuperAdminLogin|mock@serveiq.com` in `src/` — Expected: zero matches.

---

### Task 2: Superadmin API service layer

**Files:**
- Create: `src/services/superadminApi.ts` (sole owner — no other task edits this file)

**Interfaces:**
- Consumes: `src/api.ts` default axios instance; backend envelope `StandardResponse<T> = { success: boolean; data: T; meta?: unknown }`
- Produces (exact names — Tasks 4–6 import these and nothing else):
  `getDashboardMetrics`, `getSystemHealth`, `listPlans`, `createPlan`, `updatePlan`, `deletePlan`, `getTenantSubscription`, `assignSubscription`, `changeSubscription`, `listFeatureFlags`, `createFeatureFlag`, `updateFeatureFlag`, `deleteFeatureFlag`, `listAnnouncements`, `createAnnouncement`, `deleteAnnouncement`, `listAdmins`, `createAdmin`, `getAdmin`, `updateAdmin`, `deleteAdmin`, `getAdminAudit`, `impersonateAdmin`, `listAuditLogs`

- [ ] **Step 1: Implement the service.** Paths (all relative — the instance carries the base URL): `GET /superadmin/dashboard`, `GET /superadmin/health`, CRUD `GET/POST/PATCH/DELETE /superadmin/plans[/{plan_id}]`, `GET/POST/PATCH /superadmin/tenants/{tenant_id}/subscription`, CRUD `/superadmin/feature-flags[/{flag_id}]`, `GET/POST/DELETE /superadmin/announcements[/{announcement_id}]`, CRUD `/superadmin/admins[/{admin_id}]` + `GET .../audit` + `POST .../impersonate`, `GET /superadmin/audit-logs`. Unwrap the envelope and return `data`. `delete*` returns `Promise<void>`. Mirror any list query params the spec declares (e.g. `skip`/`limit` on audit-logs) as an optional params object. TypeScript interfaces for every request/response type with fields copied EXACTLY from the OpenAPI schemas in `C:\Users\Acer\.local\share\opencode\tool-output\tool_134235c0c001hRYE9kZoE4PLvM` (locate each via its `operationId`, e.g. `sa_dashboard_metrics_v1`, `sa_system_health_v1`).
- [ ] **Step 2: Verify.** Run: `npx eslint src/services/superadminApi.ts` — Expected: clean. Report the exported function list so the orchestrator can confirm it matches this contract.

---

### Task 3: Wizard rewire + host pages

**Files:**
- Modify: `src/services/pmsApi.ts`, `src/pages/HostPortalPageNew.tsx` (its `saveCurrentStep`, `propertyId === null` guards, draft restore; keep `CreateTenantWizard` modal props `open/onClose` working — superadmin `TenantsPage` renders it)
- Create: `src/pages/host/MyPropertiesPage.tsx` (default export `MyPropertiesPage`)
- Must NOT touch: `src/App.tsx` (Task 1 owns routes)

**Interfaces:**
- Consumes: existing `getTenant`/`createTenant`, `GET /properties` (via existing `getAllProperties`), `POST /properties/{id}/rooms[/images]`, special-offers/discount-codes fns (unchanged)
- Produces: `createProperty(payload): Promise<{ id: string } & Record<string, unknown>>`; `MyPropertiesPage` default export (imported by Task 1's routes)

- [ ] **Step 1: `pmsApi.ts` — remove dead step endpoints, add `createProperty`.** Delete `createGeneralInfo`, `createLocation`, `createPhotosAmenities`, `createLocalization`, `createBrandVisual` (which call `/properties/general-information`, `/create-location`, `/create-photos-and-amenities`, `/create-localization`, `/create-brand-visual` — none exist). Add `createProperty(payload: { general_information: GeneralPropertyInfo; location: Location; photos_and_amenities?: ...; localization?: ...; brand_visual?: ... | null }): Promise<{id: string} & ...>` posting to `/properties`; reuse/adapt the existing payload interfaces (`GeneralInfoPayload`, `LocationPayload`, …) renaming fields to the backend's exact schema names (`GeneralPropertyInfo`, `Location`, `PropertyPhotosAndAmenities`, `Propertylocalization`, `BrandVisual` — copy field names from the openapi file). Keep all other exports (even currently-unused ones — they map to real endpoints).
- [ ] **Step 2: `uploadPropertyImage(formData)` → `POST /properties/images`.** Change endpoint from `` `/properties/${propertyId}/images` `` to `/properties/images` and drop the `propertyId` parameter. Form field `files` and `data: string[]` handling stay as-is (backend returns `StandardResponse_List_str__`). Update both call sites in `HostPortalPageNew.tsx` (~lines 376, 438; branding logo: upload then take the first URL).
- [ ] **Step 3: Normalize trailing slashes in `pmsApi.ts`.** `/properties/` → `/properties`, `/tenants/` → `/tenants`, `/special-offers/` → `/special-offers`, `/discount-codes/` → `/discount-codes` (keep `POST /bookings/` as-is — spec has the trailing slash).
- [ ] **Step 4: `HostPortalPageNew` — create-once flow.** Restructure `saveCurrentStep` so steps `type/property/location/photos/localization/branding` only accumulate state (tenant ensure via `getTenant`/`createTenant` stays at the `property` step); on leaving `branding`, call `createProperty` with all five sections and `setPropertyId(result.id)`; steps `rooms/pricing/review` run unchanged with the real id. Update the `propertyId === null` guards (e.g. location step) and draft save/restore. If not logged in, keep the existing demo early-return behavior.
- [ ] **Step 5: Create `MyPropertiesPage`.** Guard: no stored token → `<Navigate to="/host/login" replace />`. Otherwise list properties via existing `getAllProperties()` with loading/empty states; "Create Property" button opens `CreateTenantWizard` (`src/components/CreateTenantWizard.tsx`, props `open`/`onClose`); refetch the list when the wizard closes.
- [ ] **Step 6: Verify.** Run: `npx eslint src/services/pmsApi.ts src/pages/HostPortalPageNew.tsx src/pages/host/MyPropertiesPage.tsx` — Expected: clean. Grep `general-information|create-location|create-photos|create-localization|create-brand|properties/\$\{propertyId\}/images` in `src/` — Expected: zero matches.

---

### Task 4: Wire Dashboard + System Health

**Files:**
- Modify: `src/pages/superadmin/SuperAdminDashboard.tsx`, `src/pages/superadmin/SystemHealthPage.tsx` (data-source swap only — layout stays; do NOT edit the store or the service file)

**Interfaces:**
- Consumes: `getDashboardMetrics`, `getSystemHealth` from `../..`/`../../services/superadminApi` (exact names from Task 2); `useQuery` from `@tanstack/react-query`
- Produces: pages rendering real data with loading/error/empty states

- [ ] **Step 1: Dashboard.** Replace the mock/store dashboard metrics reads with `useQuery({ queryKey: ['sa-dashboard'], queryFn: getDashboardMetrics })`. Map ONLY fields that exist in the real response (read `DashboardMetrics` from the service); drop/leave-empty widgets whose data has no backend counterpart — do not fake values. Add loading skeleton/error-with-retry/empty handling matching the page's existing style.
- [ ] **Step 2: System Health.** Same pattern with `getSystemHealth` (queryKey `['sa-health']`).
- [ ] **Step 3: Verify.** Run: `npx eslint <both files>` — Expected: clean. Neither file may import the mock store for the wired entities.

---

### Task 5: Wire Plans + Feature Flags

**Files:**
- Modify: `src/pages/superadmin/PlansPage.tsx`, `src/pages/superadmin/FeatureFlagsPage.tsx` (same rules as Task 4)

**Interfaces:**
- Consumes: `listPlans`, `createPlan`, `updatePlan`, `deletePlan`, `listFeatureFlags`, `createFeatureFlag`, `updateFeatureFlag`, `deleteFeatureFlag`; `useQuery` + `useMutation` + `useQueryClient` (invalidate `['sa-plans']` / `['sa-flags']` on success)

- [ ] **Step 1: Plans.** `useQuery(['sa-plans'], listPlans)` for the list; wire create/edit/deactivate UI actions to the matching mutations (DELETE = deactivate per spec); toast on success/error; refetch via invalidation. Remove "(mock)" markers/toasts on wired actions.
- [ ] **Step 2: Feature Flags.** Same pattern with the flag functions (queryKey `['sa-flags']`).
- [ ] **Step 3: Verify.** `npx eslint` on both files — clean; no mock-store reads for plans/flags.

---

### Task 6: Wire Announcements + Admins/Roles + Audit Logs (+ Subscriptions catalog)

**Files:**
- Modify: `src/pages/superadmin/AnnouncementsPage.tsx`, `src/pages/superadmin/AdminsRolesPage.tsx`, `src/pages/superadmin/AuditLogsPage.tsx`, `src/pages/superadmin/SubscriptionsPage.tsx`

**Interfaces:**
- Consumes: `listAnnouncements`, `createAnnouncement`, `deleteAnnouncement`, `listAdmins`, `createAdmin`, `getAdmin`, `updateAdmin`, `deleteAdmin`, (`getAdminAudit`/`impersonateAdmin` only if the page already has audit/impersonate UI), `listAuditLogs`, `listPlans` (Subscriptions catalog only)

- [ ] **Step 1: Announcements + Admins/Roles + Audit Logs.** Same query/mutation pattern (keys `['sa-announcements']`, `['sa-admins']`, `['sa-audit-logs']`; pass through spec pagination params on audit-logs if the UI paginates). Keep layout; add loading/error/empty states; toasts on mutations.
- [ ] **Step 2: Subscriptions — catalog only.** Wire the plan catalog/dropdown data to `listPlans`. Per-tenant subscription rows and assign/upgrade actions STAY on mock data (no superadmin tenant-list endpoint exists) — leave that code untouched and add a brief code comment stating why.
- [ ] **Step 3: Verify.** `npx eslint` on all four files — clean.

---

### Task 7 (orchestrator): Verify + commit

- [ ] Run `npm run build` (tsc -b + vite build) — must pass.
- [ ] Run `npm run lint` — must pass.
- [ ] Grep audit for dead references — expect zero: `reset-password`, `general-information`, `create-location`, `create-photos`, `create-localization`, `create-brand`, `superadmin-mock-auth`, `mockSuperAdminLogin`, `mock@serveiq.com`, `properties/${propertyId}/images`.
- [ ] Commit per task-scope with messages: `feat(auth): real login + routes, remove reset-password and mock superadmin auth`, `feat(api): add superadmin service layer`, `feat(wizard): consolidate property creation onto POST /properties; add host pages`, `feat(superadmin): wire dashboard+health|plans+flags|announcements+admins+audit to live API`.
- [ ] Manual smoke checklist (needs a real backend account incl. superadmin): guest/host signup → OTP → login → wizard creates a real property → appears in `/host/my-properties`; superadmin login → dashboard/plans load; remaining mock pages still render.

## Self-review

- Spec coverage: §2.1 keep (no task needed — already correct) / §2.2 role query (T1S1), image endpoint (T3S2), slash normalization (T3S3) / §2.3 consolidation (T3S1+S4) + PATCH limitation documented (T3S4) / §2.4 removal (T1S5+S6) / §3 routes (T1S5, T3S5) + `/` semantics (RootRedirect) / §4 auth (T1S2–S4) + mock-auth deletion (T1S3) / §5 eight pages (T2+T4+T5+T6) incl. Subscriptions limitation (T6S2) / §6 verification (T7).
- Placeholder scan: no TBD/TODO/"handle edge cases" — every step names exact files, functions, endpoints, commands.
- Type consistency: service function names identical in T2 contract and T4–T6 consumption; `MyPropertiesPage` default-export contract shared by T1 (import) and T3 (creation); `RootRedirect` contract shared within T1.
