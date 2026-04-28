# Implementation Plan: Card Trading Platform — Full Feature Set

**Branch**: `001-full-platform-spec` | **Date**: 2026-04-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-full-platform-spec/spec.md`

## Summary

Build the complete React 18 front-end for a collectible card trading platform
covering 26 features across 6 modules: Authentication, Card Management, Trading,
User Profile, Dashboard, and Administration. The implementation uses a strict
layer architecture (common → layout → forms → features → pages), Context API
for global state, Axios with interceptors for API communication, and Jest +
React Testing Library for testing. The back-end REST API is pre-built at
`/api/v1/` and accepted as-is.

## Technical Context

**Language/Version**: JavaScript (ES2022) · React 18.3
**Primary Dependencies**: React Router v6, Axios, PropTypes, recharts (admin stats)
**Storage**: In-memory (access token) · httpOnly cookie (refresh token, set by server)
**Testing**: Jest 29 + React Testing Library 14
**Target Platform**: Web browser (Chrome, Firefox, Edge, Safari latest-1) · Mobile responsive (≥480px)
**Project Type**: Single-page web application
**Performance Goals**: Inventory/Catalog load <2s (≤100 cards) · Trade accept <3s · Dashboard load <2s
**Constraints**: No SSR · No offline mode · No real-time (no WebSocket/polling) · No social login · No 2FA
**Scale/Scope**: Up to 10,000 users · 26 views · 40+ API endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|---|---|---|
| Layer import rules respected | ✅ Pass | All planned imports follow L1→L5 direction |
| No direct axios in components | ✅ Pass | All API calls routed through services/ |
| Component ≤200 lines | ✅ Pass | TradeBuilder is complex; decomposed into steps |
| Props ≤5 per component | ✅ Pass | Reviewed all planned components |
| JSX nesting ≤3 levels | ✅ Pass | Grid layouts stay flat |
| PropTypes mandatory | ✅ Pass | Enforced in all component specs |
| Tokens only in localStorage | ✅ Pass | Access token in-memory, refresh via httpOnly cookie |
| No dangerouslySetInnerHTML | ✅ Pass | No HTML injection patterns planned |
| Test coverage thresholds | ✅ Pass | Targets defined in constitution |
| Design tokens only (no inline styles) | ✅ Pass | All styling via theme.js tokens |

**Gate result: ✅ PASS — Phase 0 may proceed.**

## Project Structure

### Documentation (this feature)

```text
specs/001-full-platform-spec/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── auth.md
│   ├── cards.md
│   ├── trades.md
│   ├── users.md
│   └── admin.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/           # Generic card shell (not trading card)
│   │   ├── Badge/
│   │   ├── Modal/
│   │   ├── Spinner/
│   │   ├── Toast/
│   │   └── Placeholder/    # Generic image placeholder
│   ├── layout/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── MainLayout/
│   ├── forms/
│   │   ├── LoginForm/
│   │   ├── RegisterForm/
│   │   ├── CardForm/
│   │   └── TradeForm/
│   └── features/
│       ├── auth/
│       ├── cards/
│       │   ├── CardGrid/
│       │   ├── CardCard/
│       │   └── CardDetail/
│       ├── trades/
│       │   ├── TradeList/
│       │   ├── TradeCard/
│       │   ├── TradeDetail/
│       │   └── TradeBuilder/
│       ├── profile/
│       │   ├── ProfileCard/
│       │   └── ProfileStats/
│       ├── dashboard/
│       │   ├── DashboardStats/
│       │   └── QuickActions/
│       └── admin/
│           ├── AdminDashboard/
│           ├── UserManagement/
│           ├── TradeManagement/
│           └── StatsView/
├── pages/
│   ├── LoginPage/
│   ├── RegisterPage/
│   ├── ResetPasswordPage/
│   ├── DashboardPage/
│   ├── InventoryPage/
│   ├── CatalogPage/
│   ├── CardDetailPage/
│   ├── CreateCardPage/
│   ├── EditCardPage/
│   ├── TradesPage/
│   ├── CreateTradePage/
│   ├── TradeDetailPage/
│   ├── ProfilePage/
│   ├── EditProfilePage/
│   ├── ChangePasswordPage/
│   ├── PublicProfilePage/
│   └── AdminPage/
├── hooks/
│   ├── useAuth.js
│   ├── useInventory.js
│   ├── useCatalog.js
│   ├── useCardDetail.js
│   ├── useCardForm.js
│   ├── useDeleteCard.js
│   ├── useTradesList.js
│   ├── useTradeBuilder.js
│   ├── useTradeDetail.js
│   ├── useTradeAction.js
│   ├── useProfile.js
│   ├── useDashboard.js
│   ├── useAdminStats.js
│   ├── useDebounce.js
│   └── useForm.js
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── cardService.js
│   ├── tradeService.js
│   ├── userService.js
│   ├── adminService.js
│   └── storageService.js
├── context/
│   ├── AuthContext.jsx
│   ├── UIContext.jsx
│   └── NotificationContext.jsx
├── styles/
│   ├── theme.js
│   ├── colors.css
│   ├── typography.css
│   └── globals.css
└── utils/
    ├── validators.js
    ├── formatters.js
    ├── constants.js
    ├── errors.js
    └── logger.js
```

**Structure Decision**: Single React SPA (front-end only). The back-end API is
pre-built and consumed via `services/`. All 26 features reside in this single
`src/` tree following the constitution's layer hierarchy.

## Complexity Tracking

> No constitution violations — no entries required.
