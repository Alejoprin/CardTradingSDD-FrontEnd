# Data Model: Card Trading Platform

**Branch**: `001-full-platform-spec` | **Date**: 2026-04-28

This document describes the front-end data model: the shape of objects the UI
stores and passes between layers. These mirror the back-end API response schemas.

---

## Entities

### User

```js
{
  id: string,           // UUID
  username: string,     // unique, immutable
  email: string,        // unique, not shown on public profiles
  avatarUrl: string,    // URL or null → show placeholder avatar
  bio: string,          // max 500 chars, nullable
  location: string,     // nullable
  role: 'user' | 'admin',
  status: 'active' | 'banned',
  createdAt: string,    // ISO 8601
  stats: {
    totalCards: number,
    completedTrades: number,
    pendingTrades: number,
    rating: number,     // 0–5, derived from completed trades
  }
}
```

**Validation rules**:
- `username`: 3–30 chars, alphanumeric + underscores, immutable after creation.
- `email`: valid email format, immutable via UI (requires back-end process).
- `bio`: max 500 characters.
- `password` (registration/change): min 8 chars, never stored in state beyond
  form submission.

---

### Card

```js
{
  id: string,           // UUID
  userId: string,       // owner's User.id
  ownerUsername: string,// denormalized for display
  ownerAvatarUrl: string,
  name: string,         // required
  series: string,       // required, immutable after creation
  number: string,       // required, immutable after creation
  description: string,  // nullable
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  condition: 'mint' | 'near-mint' | 'good' | 'fair' | 'poor',
  imageUrl: string,     // nullable → show Placeholder component
  createdAt: string,
  updatedAt: string,
  tradeHistory: TradeHistoryItem[], // only on detail view
}
```

**TradeHistoryItem**:
```js
{
  tradeId: string,
  completedAt: string,
  counterpartUsername: string,
  direction: 'given' | 'received',
}
```

**Validation rules**:
- `name`: required, max 100 chars.
- `series` + `number`: required, read-only in edit form.
- `description`: max 500 chars.
- `rarity`: one of enum values, required.
- `condition`: one of enum values, required.
- Image: optional, max 5 MB, accepted types: jpg, png, webp.

---

### Trade

```js
{
  id: string,           // UUID
  initiatorId: string,  // User.id who proposed
  initiatorUsername: string,
  initiatorAvatarUrl: string,
  counterpartyId: string,
  counterpartyUsername: string,
  counterpartyAvatarUrl: string,
  status: 'pending' | 'completed' | 'rejected' | 'cancelled',
  offeredCards: Card[], // cards from initiator (1–3)
  requestedCards: Card[], // cards from counterparty (1–3)
  createdAt: string,
  updatedAt: string,
  timeline: TradeEvent[],
}
```

**TradeEvent**:
```js
{
  event: 'created' | 'accepted' | 'rejected' | 'cancelled',
  timestamp: string,
  actorUsername: string,
}
```

**State transition rules** (enforced in UI):
```
pending  → accepted  (counterparty only)
pending  → rejected  (counterparty only)
pending  → cancelled (initiator only)
completed/rejected/cancelled → (terminal, no further transitions)
```

**Validation rules**:
- `offeredCards`: 1–3 cards, all owned by `initiatorId`, none in another
  pending trade.
- `requestedCards`: 1–3 cards, all owned by `counterpartyId`.
- `initiatorId !== counterpartyId` (no self-trades).

---

### Activity (Dashboard feed)

```js
{
  id: string,
  userId: string,       // always the logged-in user's id
  eventType:
    | 'card_added'
    | 'card_edited'
    | 'card_deleted'
    | 'trade_proposed'
    | 'trade_received'
    | 'trade_accepted'
    | 'trade_rejected'
    | 'trade_cancelled',
  metadata: {
    cardId?: string,
    cardName?: string,
    tradeId?: string,
    counterpartUsername?: string,
  },
  createdAt: string,
}
```

**Display logic**: Feed shows last 10 Activity items for the logged-in user,
ordered by `createdAt` descending.

---

### AdminStats

```js
{
  totalUsers: number,
  totalCards: number,
  totalTrades: number,
  activeUsersToday: number,
  tradesCompletedToday: number,
  trendUsers: number,         // delta vs yesterday (positive = growth)
  trendTrades: number,
  usersByPeriod: { date: string, count: number }[],
  cardsByRarity: { rarity: string, count: number }[],
  tradesByStatus: { status: string, count: number }[],
  tradeRates: { date: string, accepted: number, rejected: number }[],
}
```

---

## Front-End State Shapes (Context & Hooks)

### AuthContext State

```js
{
  user: User | null,
  isAuthenticated: boolean,
  loading: boolean,        // true during silent refresh on app load
  login: (email, password) => Promise<void>,
  logout: () => Promise<void>,
  updateUser: (partial) => void,  // used by EditProfile to sync context
}
```

### Pagination Shape (shared)

```js
{
  page: number,
  size: number,
  total: number,
  totalPages: number,
  hasNext: boolean,
  hasPrev: boolean,
}
```

---

## In-Memory Token Store (storageService.js)

```js
// Module-level variable — NOT exported directly
let _accessToken = null;

// Exported API
setTokens({ accessToken })  // sets _accessToken
getAccessToken()            // returns _accessToken
clearTokens()               // sets _accessToken = null

// Refresh token: server-managed httpOnly cookie
// Front-end sends cookie automatically via Axios withCredentials: true
```

---

## Validation Utility Reference (utils/validators.js)

| Function | Rule |
|---|---|
| `validateEmail(v)` | RFC-5322 format |
| `validatePassword(v)` | min 8 chars |
| `validateUsername(v)` | 3–30 chars, alphanumeric + underscore |
| `validateRequired(v)` | non-empty string |
| `validateMaxLength(v, n)` | string length ≤ n |
| `validateImageFile(file)` | size ≤ 5MB, type in jpg/png/webp |
| `validateCardSide(cards)` | 1 ≤ length ≤ 3 |

---

## Constants Reference (utils/constants.js)

```js
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const MAX_TRADE_CARDS_PER_SIDE = 3;
export const MAX_IMAGE_SIZE_MB = 5;
export const ACTIVITY_FEED_SIZE = 10;
export const DEFAULT_PAGE_SIZE = 12;
export const CARD_RARITIES = ['common', 'rare', 'epic', 'legendary'];
export const CARD_CONDITIONS = ['mint', 'near-mint', 'good', 'fair', 'poor'];
export const TRADE_STATUSES = ['pending', 'completed', 'rejected', 'cancelled'];
export const USER_ROLES = ['user', 'admin'];
export const TOAST_DURATION_MS = 4000;
```
