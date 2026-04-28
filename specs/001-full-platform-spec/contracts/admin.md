# API Contract: Administration

**Base path**: `/api/v1/admin`
**Service file**: `src/services/adminService.js`

All requests require `Authorization: Bearer {accessToken}` with `role: admin`.
Non-admin requests receive `403 Forbidden`.

---

## GET /admin/stats

**Purpose**: System-wide KPIs and chart data.

**Response 200**:
```json
{
  "totalUsers": 10432,
  "totalCards": 54210,
  "totalTrades": 3812,
  "activeUsersToday": 142,
  "tradesCompletedToday": 27,
  "trendUsers": 12,
  "trendTrades": 5,
  "usersByPeriod": [
    { "date": "2026-04-21", "count": 14 }
  ],
  "cardsByRarity": [
    { "rarity": "common", "count": 30100 },
    { "rarity": "rare", "count": 15000 },
    { "rarity": "epic", "count": 6800 },
    { "rarity": "legendary", "count": 2310 }
  ],
  "tradesByStatus": [
    { "status": "completed", "count": 3201 },
    { "status": "pending", "count": 247 },
    { "status": "rejected", "count": 289 },
    { "status": "cancelled", "count": 75 }
  ],
  "tradeRates": [
    { "date": "2026-04-21", "accepted": 18, "rejected": 3 }
  ]
}
```

**Query params**:
| Param | Type | Default | Description |
|---|---|---|---|
| `period` | string | `7d` | One of: `7d`, `30d`, `90d` — affects *ByPeriod and tradeRates arrays |

---

## GET /admin/users

**Purpose**: List all users.

**Query params**:
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number |
| `size` | int | 20 | Items per page |
| `search` | string | — | Search by username or email |
| `status` | string | — | Filter: active, banned |

**Response 200**:
```json
{
  "users": [
    {
      "id": "uuid",
      "username": "trader42",
      "email": "user@example.com",
      "avatarUrl": null,
      "status": "active",
      "role": "user",
      "createdAt": "2025-01-01T00:00:00Z",
      "stats": {
        "totalCards": 24,
        "completedTrades": 11
      }
    }
  ],
  "pagination": { /* standard */ }
}
```

---

## PUT /admin/users/:userId/ban

**Purpose**: Ban a user. Automatically cancels all their pending trades.

**Request**:
```json
{
  "reason": "Violation of trading rules"
}
```

**Response 200**:
```json
{
  "userId": "uuid",
  "status": "banned",
  "cancelledTrades": 3
}
```

**Response 404**: `{ "error": "User not found" }`
**Response 409**: `{ "error": "User is already banned" }`

---

## GET /admin/trades

**Purpose**: List all trades in the system (for dispute investigation).

**Query params**:
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number |
| `size` | int | 20 | Items per page |
| `status` | string | — | Filter by status |
| `username` | string | — | Filter: trades involving this username |
| `from` | string | — | ISO date — createdAt >= from |
| `to` | string | — | ISO date — createdAt <= to |

**Response 200**: Same shape as `GET /trades` but includes all trades
(not filtered by authenticated user). Each item includes both parties'
usernames and emails.
