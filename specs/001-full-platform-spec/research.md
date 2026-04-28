# Research: Card Trading Platform — Phase 0

**Branch**: `001-full-platform-spec` | **Date**: 2026-04-28

---

## 1. Token Storage Strategy

**Decision**: Access token stored in-memory (module-scoped variable in
`storageService.js`). Refresh token handled by the server via `httpOnly`
cookie — the front-end never reads or writes it directly.

**Rationale**: `localStorage` is vulnerable to XSS. `httpOnly` cookies for
refresh tokens are the current industry standard (used by Auth0, Supabase, and
AWS Cognito). In-memory access tokens disappear on page refresh, requiring a
silent refresh on app load — acceptable trade-off for security.

**Alternatives considered**:
- `localStorage` for access token: Rejected — violates constitution §7 Security.
- `sessionStorage`: Rejected — lost on tab close, inconsistent UX across tabs.

---

## 2. Axios Interceptor Architecture

**Decision**: Single `api.js` Axios instance with two interceptors:
1. **Request interceptor**: Attaches `Authorization: Bearer {accessToken}` from
   `storageService.getAccessToken()`.
2. **Response interceptor**: On 401, attempts one silent token refresh via
   `POST /api/v1/auth/refresh`. Uses a `_retry` flag to prevent infinite loops.
   On refresh failure, calls `AuthContext.logout()` and redirects to `/login`.

**Rationale**: Centralised interceptor prevents token-handling logic from
leaking into individual services or hooks.

**Alternatives considered**:
- Per-service retry logic: Rejected — violates DRY, creates inconsistency.
- React Query with built-in retry: Rejected — adds heavy dependency for a
  pattern solvable with Axios interceptors.

---

## 3. Global State Management

**Decision**: Context API only (no Redux, no Zustand).
- `AuthContext`: user, isAuthenticated, loading, login(), logout(), updateUser()
- `NotificationContext`: toast queue, addToast(), removeToast()
- `UIContext`: sidebar open/close, global loading overlay

**Rationale**: The constitution mandates Context API for global state. The app
has limited cross-cutting state needs (auth + notifications + UI). Redux would
be premature complexity for this scope.

**Alternatives considered**:
- Zustand: Rejected — not mandated by constitution; adds a dependency for no
  gain at this scale.
- Redux Toolkit: Rejected — same reasoning; overkill for 3 context values.

---

## 4. Routing Strategy

**Decision**: React Router v6 with `createBrowserRouter`. Route protection via
a `PrivateRoute` wrapper component that reads `isAuthenticated` from
`AuthContext`. Admin routes additionally check `user.role === 'admin'`.

**Route map**:
```
/                     → redirect to /dashboard (if auth) or /login
/login                → LoginPage
/register             → RegisterPage
/reset-password       → ResetPasswordPage
/dashboard            → DashboardPage [private]
/inventory            → InventoryPage [private]
/catalog              → CatalogPage [private]
/cards/:cardId        → CardDetailPage [private]
/cards/create         → CreateCardPage [private]
/cards/:cardId/edit   → EditCardPage [private]
/trades               → TradesPage [private]
/trades/create        → CreateTradePage [private]
/trades/:tradeId      → TradeDetailPage [private]
/profile              → ProfilePage [private]
/profile/edit         → EditProfilePage [private]
/profile/password     → ChangePasswordPage [private]
/users/:userId        → PublicProfilePage [private]
/admin                → AdminPage [private + admin]
```

**Rationale**: React Router v6 is the standard for React SPAs. `createBrowserRouter`
enables future data loaders if needed.

---

## 5. Form Management

**Decision**: Custom `useForm.js` hook (no Formik, no React Hook Form).
State: `{ values, errors, touched, isSubmitting }`. Methods: `handleChange`,
`handleBlur`, `handleSubmit`, `setFieldError`, `reset`.

**Rationale**: The constitution limits external dependencies. The forms in this
project (login, register, card, profile, password) are predictable and don't
require a full form library. `CardForm.jsx` is the most complex (7 fields +
image upload) — still manageable with a lightweight custom hook.

**Alternatives considered**:
- React Hook Form: Rejected — adds dependency; constitution prefers minimal
  abstractions.
- Formik: Rejected — same reasoning; heavier bundle.

---

## 6. Image Upload Handling

**Decision**: `createCard` and `updateCard` send `multipart/form-data` via
Axios. The `api.js` instance does NOT set `Content-Type: application/json`
globally — instead each service call sets headers per-request as needed.
Multipart calls use `axios.post(url, formData)` with no explicit `Content-Type`
(Axios auto-detects it for FormData objects).

**Rationale**: Axios automatically adds the correct `multipart/form-data` with
boundary when passed a `FormData` object. Manual header override would break
boundary injection.

**Image fallback**: Cards without an image display a generic placeholder
component (`Placeholder.jsx` in `common/`) — a card-shaped grey box with a
card icon. This is rendered consistently across CardCard, CardDetail, TradeCard,
and TradeDetail.

---

## 7. Trade Card Selection UI

**Decision**: Multi-select card picker (checkbox overlay on card thumbnails)
with a hard cap of 3 per side enforced client-side. The selection state lives
in `useTradeBuilder.js`. Attempting to select a 4th card shows an inline
validation message: "Maximum 3 cards per side".

**Rationale**: Spec clarification #1 set the limit at 3. Checkbox overlay on
card grid is the least disruptive UX pattern for multi-select.

---

## 8. Admin Statistics Charts

**Decision**: Use `recharts` library for all admin charts:
- Bar chart: new users per period
- Pie chart: cards by rarity
- Bar chart: trades by status
- Line chart: acceptance/rejection rate over time

**Rationale**: `recharts` is the most widely used React charting library, has
excellent React 18 support, and is composable. The constitution does not
prohibit charting libraries for admin-only features.

**Alternatives considered**:
- Chart.js (react-chartjs-2): Rejected — Canvas-based, harder to style with CSS
  tokens; larger bundle for admin-only use.
- D3 directly: Rejected — too verbose for standard chart types.

---

## 9. Notification / Toast System

**Decision**: `NotificationContext` maintains a queue of toast objects
`{ id, type, message, duration }`. A `ToastContainer.jsx` component (mounted
in `MainLayout`) renders the queue. Toasts auto-dismiss after `duration` ms
(default 4000). `addToast(type, message)` is called from hooks after API
operations.

**Rationale**: The spec requires toast notifications after trade actions and
card operations. A context-based queue avoids prop-drilling the toast trigger
down through multiple component layers.

---

## 10. Silent Refresh on App Load

**Decision**: `AuthContext` runs a `useEffect` on mount that calls
`authService.refresh()` (POST `/api/v1/auth/refresh`) to silently restore
the access token using the httpOnly cookie. If the call succeeds, the user is
considered authenticated. If it fails, the user is treated as logged out.

**Rationale**: Because access tokens are in-memory, a page refresh clears them.
The silent refresh on load restores session without requiring the user to log in
again after every page refresh.
