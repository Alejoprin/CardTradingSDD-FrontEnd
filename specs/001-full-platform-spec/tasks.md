---
description: "Task list for Card Trading Platform — Full Feature Set"
---

# Tasks: Card Trading Platform — Full Feature Set

**Input**: Design documents from `/specs/001-full-platform-spec/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Organization**: Tasks grouped by user story to enable independent implementation.
Tests are NOT included (not requested in spec).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to spec user story (US1–US11)
- All paths relative to `src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project skeleton, environment, design tokens, shared utilities.

- [X] T001 Create full `src/` directory structure per plan.md (components/common, layout, forms, features, pages, hooks, services, context, styles, utils)
- [X] T002 [P] Create `src/styles/theme.js` with all design tokens (colors, spacing, typography, radius, shadows, breakpoints) from constitution §3
- [X] T003 [P] Create `src/styles/globals.css` with CSS reset and base body/html styles using theme tokens
- [X] T004 [P] Create `src/styles/colors.css` and `src/styles/typography.css` with CSS custom properties from constitution §3
- [X] T005 [P] Create `src/utils/constants.js` (API_BASE_URL, MAX_TRADE_CARDS_PER_SIDE=3, DEFAULT_PAGE_SIZE=12, CARD_RARITIES, CARD_CONDITIONS, TRADE_STATUSES, TOAST_DURATION_MS)
- [X] T006 [P] Create `src/utils/validators.js` (validateEmail, validatePassword, validateUsername, validateRequired, validateMaxLength, validateImageFile, validateCardSide)
- [X] T007 [P] Create `src/utils/formatters.js` (formatDate, formatRelativeTime, formatUsername)
- [X] T008 [P] Create `src/utils/errors.js` (AppError class, parseApiError helper)
- [X] T009 [P] Create `src/utils/logger.js` (log, warn, error — wraps console, no-op in production)
- [X] T010 Create `.env.example` with `REACT_APP_API_BASE_URL=http://localhost:8080/api/v1`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required by ALL user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T011 Create `src/services/api.js` — Axios instance with `baseURL`, `timeout: 15000`, `Content-Type: application/json`, `withCredentials: true` (no interceptors yet — added in US1)
- [X] T012 [P] Create `src/services/storageService.js` — module-level `_accessToken` variable with `setTokens`, `getAccessToken`, `clearTokens` exports
- [X] T013 [P] Create `src/context/NotificationContext.jsx` — toast queue state, `addToast(type, message)`, `removeToast(id)`, custom `useNotification` hook
- [X] T014 [P] Create `src/context/UIContext.jsx` — sidebar open/close state, global loading state, `useUI` custom hook
- [X] T015 Create `src/components/common/Button/Button.jsx` + PropTypes: label (required), onClick, variant (primary|secondary|danger), isLoading, disabled, type
- [X] T016 [P] Create `src/components/common/Input/Input.jsx` + PropTypes: name, label, value, onChange, onBlur, error, type, placeholder, disabled
- [X] T017 [P] Create `src/components/common/Badge/Badge.jsx` + PropTypes: label (required), variant (success|warning|error|info|neutral)
- [X] T018 [P] Create `src/components/common/Modal/Modal.jsx` + PropTypes: isOpen (required), onClose (required), title, children (required), size
- [X] T019 [P] Create `src/components/common/Spinner/Spinner.jsx` + PropTypes: size (sm|md|lg), label
- [X] T020 [P] Create `src/components/common/Toast/Toast.jsx` and `ToastContainer.jsx` — renders `NotificationContext` queue; auto-dismisses after `TOAST_DURATION_MS`
- [X] T021 [P] Create `src/components/common/Placeholder/Placeholder.jsx` — card-shaped grey box with card icon; used when `imageUrl` is null. PropTypes: size (sm|md|lg)
- [X] T022 Create `src/hooks/useForm.js` — form state `{ values, errors, touched, isSubmitting }`, `handleChange`, `handleBlur`, `handleSubmit`, `setFieldError`, `reset`
- [X] T023 Create `src/hooks/useDebounce.js` — debounce hook with configurable delay (default 400ms)
- [X] T024 Create `src/components/layout/MainLayout/MainLayout.jsx` — renders Header, Sidebar, main content area, Footer, and ToastContainer. PropTypes: children (required)
- [X] T025 [P] Create `src/components/layout/Header/Header.jsx` — logo, nav links, user avatar/username via props, logout button via `onLogout` prop. PropTypes: user, onLogout. (Note: T029b in Phase 3 wires `useAuth()` into the Header caller; Header itself stays prop-driven to avoid Phase 2 dependency on Phase 3 context)
- [X] T026 [P] Create `src/components/layout/Sidebar/Sidebar.jsx` — navigation links (Dashboard, Inventory, Catalog, Trades, Profile); active state per route
- [X] T027 [P] Create `src/components/layout/Footer/Footer.jsx` — copyright line, minimal links
- [X] T028 Create `src/App.jsx` with `createBrowserRouter` and public routes only (`/login`, `/register`, `/reset-password`, catch-all redirect to `/login`); protected routes are stubs that render null until T028b in Phase 3

**Checkpoint**: Foundation ready — all user story phases can begin.

---

## Phase 3: User Story 1 — Authentication P1 (Priority: P1) 🎯 MVP

**Stories covered**: A1 (Login), A2 (Register), A4 (Logout), A5 (Token Refresh)
**Goal**: User can register, log in, maintain session, and log out.
**Independent Test**: Register → see Dashboard → logout → confirm redirect to `/login` → login again → Dashboard.

### Implementation for US1

- [X] T029 [US1] Create `src/context/AuthContext.jsx` — state `{ user, isAuthenticated, loading }`, methods `login`, `logout`, `updateUser`; on mount calls `authService.refresh()` for silent restore; custom `useAuth` hook exported
- [X] T030 [P] [US1] Create `src/services/authService.js` with `login(email, password)` → POST `/auth/login`, `register(email, username, password)` → POST `/auth/register`, `logout()` → POST `/auth/logout`, `refresh()` → POST `/auth/refresh`, `changePassword(currentPassword, newPassword)` → POST `/auth/password/change`
- [X] T031 [US1] Add Axios request interceptor to `src/services/api.js` — attaches `Authorization: Bearer {token}` from `storageService.getAccessToken()`
- [X] T032 [US1] Add Axios response interceptor to `src/services/api.js` — on 401: sets `_retry` flag, calls `authService.refresh()`, stores new token, retries original request; on refresh failure: calls `AuthContext.logout()` and redirects to `/login`
- [X] T033 [P] [US1] Create `src/components/forms/LoginForm/LoginForm.jsx` — email + password fields using `useForm`; inline validation via `validators.js`; submit calls `useAuth().login`; PropTypes: onSuccess
- [X] T034 [P] [US1] Create `src/pages/LoginPage/LoginPage.jsx` — renders `LoginForm`; redirects to `/dashboard` on success; redirects to `/dashboard` if already authenticated
- [X] T035 [P] [US1] Create `src/components/forms/RegisterForm/RegisterForm.jsx` — email, username, password, confirm-password fields; validates all via `validators.js`; on submit calls `authService.register` then `authService.login` and updates `AuthContext`
- [X] T036 [P] [US1] Create `src/pages/RegisterPage/RegisterPage.jsx` — renders `RegisterForm`; redirects to `/dashboard` on success
- [X] T037 [US1] Create `src/components/common/PrivateRoute/PrivateRoute.jsx` — reads `useAuth().isAuthenticated`; shows `Spinner` during `loading`; redirects to `/login` if not authenticated
- [X] T038 [P] [US1] Create `src/components/common/AdminRoute/AdminRoute.jsx` — extends `PrivateRoute`; additionally checks `user.role === 'admin'`; shows Forbidden message if non-admin
- [X] T028b [US1] Update `src/App.jsx` — add all protected routes wrapped in `PrivateRoute` and admin routes wrapped in `AdminRoute` (depends on T037, T038); replaces stub routes from T028

**Checkpoint**: User can register, login, logout, and session auto-restores on refresh.

---

## Phase 4: User Story 2 — Password Reset (Priority: P2)

**Story covered**: A3
**Goal**: Forgotten-password recovery via email.
**Independent Test**: Request reset for known email → confirmation message → (simulate token) → set new password → login with new password succeeds.

### Implementation for US2

- [X] T039 [US2] Add `requestPasswordReset(email)` → POST `/auth/password/reset` and `confirmPasswordReset(token, newPassword)` → POST `/auth/password/reset/confirm` to `src/services/authService.js`
- [X] T040 [US2] Create `src/pages/ResetPasswordPage/ResetPasswordPage.jsx` — manages internal state `{ mode: 'request' | 'confirm' }`; in `request` mode renders email field; in `confirm` mode renders token + new-password + confirm-password fields; on confirm success redirects to `/login`

**Checkpoint**: Password reset flow complete end-to-end.

---

## Phase 5: User Story 3 — Card Creation (Priority: P1) 🎯 MVP

**Story covered**: B4
**Goal**: User can add a new card (with optional image) to their inventory.
**Independent Test**: Fill Create Card form → submit → card appears in Inventory with correct data and placeholder if no image uploaded.

### Implementation for US3

- [X] T041 [US3] Create `src/services/cardService.js` with `createCard(formData)` → POST `/cards` (multipart/form-data)
- [X] T042 [US3] Create `src/hooks/useCardForm.js` — form state for card fields (name, series, number, description, rarity, condition, image); validates all via `validators.js`; supports `mode: 'create' | 'edit'` via `initialValues` prop; `submit` calls `cardService.createCard` or `cardService.updateCard`
- [X] T043 [US3] Create `src/components/forms/CardForm/CardForm.jsx` — renders all card fields as `Input` + `select` elements; image upload with preview; uses `useCardForm`; displays inline validation errors; PropTypes: initialValues, onSuccess, mode
- [X] T044 [US3] Create `src/pages/CreateCardPage/CreateCardPage.jsx` — renders `CardForm` in create mode; on success redirects to `/inventory` with success toast

**Checkpoint**: Cards can be created and appear in inventory.

---

## Phase 6: User Story 4 — My Inventory (Priority: P1) 🎯 MVP

**Story covered**: B1
**Goal**: User sees all their own cards with search, filter, and pagination.
**Independent Test**: Navigate to `/inventory` → cards listed → search narrows list → rarity filter works → pagination navigates.

### Implementation for US4

- [X] T045 [US4] Add `getUserInventory(userId, params)` → GET `/users/{userId}/inventory` (page, size, search, rarity, condition) to `src/services/cardService.js`
- [X] T046 [US4] Create `src/hooks/useInventory.js` — state `{ cards, loading, error, pagination, filters }`; calls `cardService.getUserInventory` with debounced search; updates on filter change
- [X] T047 [P] [US4] Create `src/components/features/cards/CardGrid/CardGrid.jsx` — responsive CSS Grid; renders array of `CardCard`; shows `Spinner` while loading; shows empty state when cards=[]. PropTypes: cards (required), loading, emptyMessage
- [X] T048 [US4] Create `src/components/features/cards/CardCard/CardCard.jsx` — shows `imageUrl` or `Placeholder`, name, `Badge` for rarity, condition text, owner username (when `showOwner=true`), "Propose Trade" button (when `isOwn=false`), Edit/Delete buttons (when `isOwn=true`). PropTypes: card (required), isOwn, showOwner, onEdit, onDelete, onProposeTrade
- [X] T049 [US4] Create `src/pages/InventoryPage/InventoryPage.jsx` — uses `useInventory` with `userId` from `useAuth`; renders search `Input`, rarity filter `select`, condition filter `select`, `CardGrid`, pagination controls

**Checkpoint**: Inventory fully functional with search, filter, pagination.

---

## Phase 7: User Story 5 — Card Catalog (Priority: P1) 🎯 MVP

**Story covered**: B2
**Goal**: User browses all cards from all users; can trigger trade from catalog.
**Independent Test**: Navigate to `/catalog` → cards from all users shown with owner names → click "Propose Trade" on another user's card → trade creation opens pre-filled.

### Implementation for US5

- [X] T050 [US5] Add `listCards(params)` → GET `/cards` (page, size, search, rarity, condition) to `src/services/cardService.js`
- [X] T051 [US5] Create `src/hooks/useCatalog.js` — state `{ cards, loading, error, pagination, filters }`; calls `cardService.listCards` with debounced search
- [X] T052 [US5] Create `src/pages/CatalogPage/CatalogPage.jsx` — uses `useCatalog`; renders search, filters, `CardGrid` with `showOwner=true`; "Propose Trade" button on non-own cards navigates to `/trades/create?targetUserId={userId}&cardId={cardId}`

**Checkpoint**: Catalog shows all-platform cards; trade initiation works from catalog.

---

## Phase 8: User Story 6 — Card Detail, Edit & Delete (Priority: P2)

**Stories covered**: B3, B5, B6
**Goal**: User views full card detail; owner can edit or delete.
**Independent Test**: Navigate to card detail → all fields shown → owner sees Edit/Delete → edit condition → updated in detail → delete (non-trade card) → gone from inventory.

### Implementation for US6

- [X] T053 [US6] Add `getCard(cardId)` → GET `/cards/{cardId}`, `updateCard(cardId, formData)` → PUT `/cards/{cardId}` (multipart), `deleteCard(cardId)` → DELETE `/cards/{cardId}` to `src/services/cardService.js`
- [X] T054 [P] [US6] Create `src/hooks/useCardDetail.js` — state `{ card, loading, error }`; calls `cardService.getCard(cardId)`
- [X] T055 [P] [US6] Create `src/hooks/useDeleteCard.js` — state `{ loading, error }`; method `deleteCard(cardId)` calls `cardService.deleteCard`; on success calls `addToast` and navigates to `/inventory`
- [X] T056 [US6] Create `src/components/features/cards/CardDetail/CardDetail.jsx` — large image or `Placeholder`, all card fields, trade history list, owner info with link to `/users/{userId}`, conditional Edit/Delete (own) or "Propose Trade" (other) buttons. PropTypes: card (required), isOwn (required)
- [X] T057 [US6] Create `src/pages/CardDetailPage/CardDetailPage.jsx` — uses `useCardDetail` with `cardId` from URL params; Delete button opens `Modal` confirmation before calling `useDeleteCard`
- [X] T058 [US6] Create `src/pages/EditCardPage/EditCardPage.jsx` — calls `cardService.getCard` on mount; renders `CardForm` in edit mode with `initialValues`; on success redirects to `/cards/{cardId}`

**Checkpoint**: Full card lifecycle (view/edit/delete) functional.

---

## Phase 9: User Story 7 — Trading P1: Propose, List, Accept, Reject (Priority: P1) 🎯 MVP

**Stories covered**: C1 (My Trades), C2 (Propose Trade), C4 (Accept), C5 (Reject)
**Goal**: User can propose, list, accept, and reject trades.
**Independent Test**: Propose trade → appears in My Trades as Pending → accept as recipient → both inventories updated, status = Completed.

### Implementation for US7

- [X] T059 [US7] Create `src/services/tradeService.js` with `listTrades(params)` → GET `/trades`, `createTrade(body)` → POST `/trades`, `getTrade(tradeId)` → GET `/trades/{tradeId}`, `acceptTrade(tradeId)` → PUT `/trades/{tradeId}/accept`, `rejectTrade(tradeId)` → PUT `/trades/{tradeId}/reject`
- [X] T060 [P] [US7] Create `src/hooks/useTradesList.js` — state `{ trades, loading, error, pagination, activeTab }`; calls `tradeService.listTrades({ status: activeTab })`
- [X] T061 [P] [US7] Create `src/hooks/useTradeAction.js` — state `{ loading, error }`; methods `accept(tradeId)` and `reject(tradeId)` only (cancel added in T069 once cancelTrade service method exists); calls respective `tradeService` methods; on success calls `addToast`
- [X] T062 [US7] Create `src/hooks/useTradeBuilder.js` — state `{ step (1-3), selectedOwnCards[], selectedTargetCards[], targetUserId, loading }`; enforces MAX_TRADE_CARDS_PER_SIDE=3; reads `targetUserId` + `cardId` from query params for pre-fill; `submit` calls `tradeService.createTrade`
- [X] T063 [P] [US7] Create `src/components/features/trades/TradeCard/TradeCard.jsx` — summary card: counterpart username+avatar, offered/requested card counts, status `Badge`, action buttons (Accept/Reject for recipient when pending; Cancel for initiator when pending). PropTypes: trade (required), currentUserId (required), onAccept, onReject, onCancel
- [X] T064 [P] [US7] Create `src/components/features/trades/TradeList/TradeList.jsx` — tab bar (Pending/Completed/Rejected/Cancelled); renders list of `TradeCard` for active tab; empty state per tab. PropTypes: trades (required), activeTab (required), onTabChange (required), currentUserId (required), loading, onAccept, onReject, onCancel
- [X] T065 [US7] Create `src/pages/TradesPage/TradesPage.jsx` — uses `useTradesList` and `useTradeAction`; passes handlers to `TradeList`; Accept/Reject open `Modal` confirmation before calling action
- [X] T066 [US7] Create `src/components/features/trades/TradeBuilder/TradeBuilder.jsx` — 3-step stepper: step 1 multi-select own cards (calls `cardService.getUserInventory` for authenticated user); step 2 multi-select target cards (calls `cardService.getUserInventory` for `targetUserId`); step 3 review summary + confirm. Enforces 3-card max per side with inline error. PropTypes: onSuccess
- [X] T067 [US7] Create `src/pages/CreateTradePage/CreateTradePage.jsx` — renders `TradeBuilder`; reads `targetUserId` + `cardId` query params; on success redirects to `/trades` with toast

**Checkpoint**: Complete trade propose → accept/reject lifecycle functional.

---

## Phase 10: User Story 8 — Trading P2: Detail & Cancel (Priority: P2)

**Stories covered**: C3 (Trade Detail), C6 (Cancel)
**Goal**: User sees full trade detail; proposer can cancel pending trades.
**Independent Test**: Open trade detail → both card sets shown → cancel as initiator → status = Cancelled, cards freed.

### Implementation for US8

- [X] T068 [US8] Create `src/hooks/useTradeDetail.js` — state `{ trade, loading, error }`; calls `tradeService.getTrade(tradeId)`
- [X] T069 [US8] Add `cancelTrade(tradeId)` → DELETE `/trades/{tradeId}` to `src/services/tradeService.js`; add `cancel(tradeId)` method to `src/hooks/useTradeAction.js` (first available after cancelTrade service exists)
- [X] T070 [US8] Create `src/components/features/trades/TradeDetail/TradeDetail.jsx` — two-column layout (offered cards | requested cards), counterpart info with link to `/users/{userId}`, status `Badge`, timeline list, action buttons conditional on status + role. PropTypes: trade (required), currentUserId (required), onAccept, onReject, onCancel, readonly (for admin view)
- [X] T071 [US8] Create `src/pages/TradeDetailPage/TradeDetailPage.jsx` — uses `useTradeDetail` with `tradeId` from URL params; uses `useTradeAction`; Cancel button only visible when `trade.status === 'pending' && trade.initiatorId === currentUser.id`; Cancel opens `Modal` confirmation; on cancel success redirects to `/trades`

**Checkpoint**: Trade detail and cancel fully functional.

---

## Phase 11: User Story 9 — Dashboard (Priority: P1) 🎯 MVP

**Story covered**: E1
**Goal**: Authenticated user sees stats, quick actions, and own activity feed.
**Independent Test**: Login → Dashboard shows correct card count and pending trade count → quick actions navigate correctly → activity feed lists own events in reverse-chronological order.

### Implementation for US9

- [X] T071b [US9] Create `src/services/userService.js` stub with `getUserProfile(userId)` → GET `/users/{userId}` and `getActivityFeed(userId)` → GET `/users/{userId}/activity`; this stub is expanded with `updateUserProfile` in T076 (Phase 12)
- [X] T072 [US9] Create `src/hooks/useDashboard.js` — calls in parallel: `userService.getUserProfile(userId)` for stats, `tradeService.listTrades({ status: 'pending', size: 5 })` for pending count, `cardService.getUserInventory(userId, { size: 4 })` for recent cards, `userService.getActivityFeed(userId)` for last 10 activity events; aggregates state `{ stats, pendingTrades, recentCards, activities, loading, error }` (depends on T071b)
- [X] T073 [P] [US9] Create `src/components/features/dashboard/DashboardStats/DashboardStats.jsx` — 3 stat cards: Total Cards, Pending Trades, Completed Trades. PropTypes: stats (required), loading
- [X] T074 [P] [US9] Create `src/components/features/dashboard/QuickActions/QuickActions.jsx` — 3 buttons: "Add Card" → `/cards/create`, "Explore Catalog" → `/catalog`, "My Trades" → `/trades`. No props required.
- [X] T075 [US9] Create `src/pages/DashboardPage/DashboardPage.jsx` — uses `useDashboard`; renders `DashboardStats`, `QuickActions`, and activity feed list (icon + message + timestamp per event; empty state when no events)

**Checkpoint**: Dashboard fully functional with live stats and activity feed.

---

## Phase 12: User Story 10 — User Profile (Priority: P2)

**Stories covered**: D1 (View), D2 (Edit), D3 (Change Password), D4 (Public Profile)
**Goal**: Users manage their profile and view others'.
**Independent Test**: View My Profile → stats correct → edit bio → bio updated → view another user's public profile → email hidden → "Propose Trade" button visible.

### Implementation for US10

- [X] T076 [US10] Expand `src/services/userService.js` (stub created in T071b) — add `updateUserProfile(userId, formData)` → PUT `/users/{userId}` (multipart/form-data)
- [X] T077 [P] [US10] Create `src/hooks/useProfile.js` — state `{ profile, loading, error }`; calls `userService.getUserProfile(userId)`
- [X] T078 [P] [US10] Create `src/components/features/profile/ProfileCard/ProfileCard.jsx` — avatar (or placeholder), username, email (only when `showEmail=true`), bio, location. PropTypes: profile (required), showEmail, readonly
- [X] T079 [P] [US10] Create `src/components/features/profile/ProfileStats/ProfileStats.jsx` — total cards, completed trades, pending trades, rating. PropTypes: stats (required)
- [X] T080 [US10] Create `src/pages/ProfilePage/ProfilePage.jsx` — uses `useProfile` with `userId` from `useAuth`; renders `ProfileCard` (showEmail=true), `ProfileStats`; Edit Profile, Change Password, Logout buttons
- [X] T081 [US10] Create `src/pages/EditProfilePage/EditProfilePage.jsx` — form with avatar upload, bio (max 500), location fields; calls `userService.updateUserProfile`; on success calls `AuthContext.updateUser` and redirects to `/profile`
- [X] T082 [US10] Create `src/pages/ChangePasswordPage/ChangePasswordPage.jsx` — form: current password, new password, confirm new password; calls `authService.changePassword`; on success: toast + redirect to `/profile`
- [X] T083 [US10] Create `src/pages/PublicProfilePage/PublicProfilePage.jsx` — reads `userId` from URL params; uses `useProfile`; calls `cardService.getUserInventory(userId)` for their cards; renders `ProfileCard` (showEmail=false, readonly=true), `ProfileStats`, `CardGrid` of their cards; "Propose Trade" button (hidden if `userId === currentUser.id`)

**Checkpoint**: Full profile management and public profiles functional.

---

## Phase 13: User Story 11 — Administration (Priority: P3)

**Stories covered**: F1 (Admin Dashboard), F2 (User Management), F3 (Trade Management), F4 (Stats)
**Goal**: Admin users can monitor and moderate the platform.
**Independent Test**: Login as admin → Admin Dashboard shows non-zero KPIs → ban user → user status = Banned in list → view any trade detail → no accept/reject/cancel actions shown.

### Implementation for US11

- [X] T084 [US11] Create `src/services/adminService.js` with `getStats(params)` → GET `/admin/stats`, `listUsers(params)` → GET `/admin/users`, `banUser(userId, body)` → PUT `/admin/users/{userId}/ban`, `listAllTrades(params)` → GET `/admin/trades`
- [X] T085 [P] [US11] Create `src/hooks/useAdminStats.js` — state `{ stats, loading, error }`; calls `adminService.getStats(params)`
- [X] T085b [P] [US11] Create `src/hooks/useUserManagement.js` — state `{ users, loading, error, pagination, searchQuery, statusFilter }`; calls `adminService.listUsers(params)` with debounced search; method `ban(userId, reason)` calls `adminService.banUser` and updates local list. (Constitution Principle I: hooks orchestrate logic)
- [X] T085c [P] [US11] Create `src/hooks/useTradeManagement.js` — state `{ trades, loading, error, pagination, searchQuery, statusFilter, dateRange }`; calls `adminService.listAllTrades(params)` with filters. (Constitution Principle I: hooks orchestrate logic)
- [X] T086 [P] [US11] Create `src/components/features/admin/AdminDashboard/AdminDashboard.jsx` — 5 KPI stat cards: Total Users, Total Cards, Total Trades, Active Today, Completed Today; trend indicators (↑/↓ based on `trendUsers`, `trendTrades`). PropTypes: stats (required), loading
- [X] T087 [US11] Create `src/components/features/admin/UserManagement/UserManagement.jsx` — uses `useUserManagement` hook; renders paginated table (username, email, status badge, role, joined date, total cards, completed trades); search input; status filter; "Ban" button opens `Modal` confirmation; on confirm calls `useUserManagement.ban`. PropTypes: UserManagement.propTypes = {} (no external props)
- [X] T088 [US11] Create `src/components/features/admin/TradeManagement/TradeManagement.jsx` — uses `useTradeManagement` hook; renders paginated table (trade ID, initiator, counterparty, status badge, card counts, date); search by username; filter by status + date range; clicking a trade opens `TradeDetail` in `Modal` with `readonly=true`. PropTypes: TradeManagement.propTypes = {} (no external props)
- [X] T088b [P] [US11] Add recharts to package.json (`npm install recharts`) before implementing StatsView
- [X] T089 [US11] Create `src/components/features/admin/StatsView/StatsView.jsx` — period selector (7d/30d/90d); bar chart (users by period), pie chart (cards by rarity), bar chart (trades by status), line chart (acceptance/rejection rates) using `recharts`; CSV export button generates Blob from stats data and triggers browser download. PropTypes: stats (required), period (required), onPeriodChange (required)
- [X] T090 [US11] Create `src/pages/AdminPage/AdminPage.jsx` — uses `AdminRoute` protection; tab navigation: Dashboard, Users, Trades, Statistics; renders respective feature components; fetches `adminService.getStats` on mount

**Checkpoint**: Admin panel fully functional.

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories.

- [X] T091 [P] Add `src/components/common/ErrorBoundary/ErrorBoundary.jsx` — React error boundary wrapping `MainLayout`; shows friendly fallback UI on unhandled errors
- [X] T092 [P] Add loading skeleton components for `CardGrid` and `TradeList` (avoid layout shift during data fetch)
- [X] T093 [P] Accessibility audit: verify all interactive elements have ARIA labels, keyboard navigation works, and `Modal` traps focus
- [X] T094 [P] Add `src/components/common/EmptyState/EmptyState.jsx` — reusable empty state with icon, message, and optional CTA button; replace all inline empty states
- [X] T095 Run `quickstart.md` validation checklist end-to-end and fix any failing items

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **US1 Auth P1 (Phase 3)**: Depends on Phase 2 — **BLOCKS all subsequent phases** (PrivateRoute required)
- **US2 Auth P2 (Phase 4)**: Depends on Phase 3 (authService exists)
- **US3 Card Create (Phase 5)**: Depends on Phase 3 (auth)
- **US4 My Inventory (Phase 6)**: Depends on US3 (cardService exists)
- **US5 Catalog (Phase 7)**: Depends on US3 (cardService exists) — can run in parallel with US4
- **US6 Card Detail/Edit/Delete (Phase 8)**: Depends on US4 + US5
- **US7 Trading P1 (Phase 9)**: Depends on US4 (inventory for card selection)
- **US8 Trading P2 (Phase 10)**: Depends on US7
- **US9 Dashboard (Phase 11)**: Depends on US3 + US7 (services exist)
- **US10 Profile (Phase 12)**: Depends on Phase 3 (auth) — can run in parallel with US7
- **US11 Admin (Phase 13)**: Depends on Phase 3 (auth + AdminRoute)
- **Polish (Phase 14)**: Depends on all user story phases

### Within Each User Story

- Services before hooks
- Hooks before components
- Components before pages
- Core implementation before integration

### Parallel Opportunities

- All Phase 1 tasks marked [P] run in parallel
- All Phase 2 common component tasks [P] run in parallel after T011+T012
- US4 (Inventory) and US5 (Catalog) can run in parallel after US3
- US10 (Profile) can run in parallel with US7 (Trading) after Phase 3

---

## Parallel Example: Phase 2 Common Components

```
# All runnable in parallel after T011, T012:
Task: "Create Button in src/components/common/Button/Button.jsx"        [T015]
Task: "Create Input in src/components/common/Input/Input.jsx"           [T016]
Task: "Create Badge in src/components/common/Badge/Badge.jsx"           [T017]
Task: "Create Modal in src/components/common/Modal/Modal.jsx"           [T018]
Task: "Create Spinner in src/components/common/Spinner/Spinner.jsx"     [T019]
Task: "Create Toast in src/components/common/Toast/Toast.jsx"           [T020]
Task: "Create Placeholder in src/components/common/Placeholder/"        [T021]
Task: "Create Header in src/components/layout/Header/Header.jsx"        [T025]
Task: "Create Sidebar in src/components/layout/Sidebar/Sidebar.jsx"     [T026]
Task: "Create Footer in src/components/layout/Footer/Footer.jsx"        [T027]
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — **blocks everything**
3. Complete Phase 3: US1 Auth P1 — **blocks everything**
4. Complete Phase 5: US3 Card Create
5. Complete Phase 6: US4 My Inventory
6. Complete Phase 7: US5 Catalog
7. Complete Phase 9: US7 Trading P1
8. Complete Phase 11: US9 Dashboard
9. **STOP and VALIDATE** using `quickstart.md` P1 checklist items
10. Deploy/demo MVP

### Incremental Delivery

1. MVP (above) → Auth + Cards + Trading + Dashboard
2. Add P2 features → Password Reset, Card Detail/Edit/Delete, Trade Detail/Cancel, Profile
3. Add P3 features → Admin Panel
4. Polish → Error boundary, skeletons, a11y

---

## Notes

- [P] tasks = different files, no dependencies within the phase
- [USN] label maps task to user story for traceability
- Tests not included (not requested); add with `/speckit-tasks --tdd` if needed
- Verify quickstart.md validation after each phase checkpoint
- Commit after each phase or logical group
- `recharts` must be added to `package.json` before Phase 13 begins
