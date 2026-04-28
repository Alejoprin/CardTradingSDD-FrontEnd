# API Contract: Cards

**Base path**: `/api/v1`
**Service file**: `src/services/cardService.js`

All requests require `Authorization: Bearer {accessToken}`.

---

## GET /cards

**Purpose**: List all cards across all users (catalog view).

**Query params**:
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number |
| `size` | int | 12 | Items per page |
| `search` | string | — | Filter by card name (partial match) |
| `rarity` | string | — | One of: common, rare, epic, legendary |
| `condition` | string | — | One of: mint, near-mint, good, fair, poor |

**Response 200**:
```json
{
  "cards": [
    {
      "id": "uuid",
      "userId": "uuid",
      "ownerUsername": "trader42",
      "ownerAvatarUrl": null,
      "name": "Charizard",
      "series": "Base Set",
      "number": "4/102",
      "rarity": "rare",
      "condition": "near-mint",
      "imageUrl": "https://...",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 12,
    "total": 87,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## GET /cards/:cardId

**Purpose**: Get full details of a single card including trade history.

**Response 200**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "ownerUsername": "trader42",
  "ownerAvatarUrl": null,
  "name": "Charizard",
  "series": "Base Set",
  "number": "4/102",
  "description": "Holographic, lightly played.",
  "rarity": "rare",
  "condition": "near-mint",
  "imageUrl": "https://...",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-02-01T00:00:00Z",
  "tradeHistory": [
    {
      "tradeId": "uuid",
      "completedAt": "2026-03-01T00:00:00Z",
      "counterpartUsername": "collector99",
      "direction": "received"
    }
  ]
}
```

**Response 404**: `{ "error": "Card not found" }`

---

## POST /cards

**Purpose**: Create a new card (multipart/form-data).

**Content-Type**: `multipart/form-data`

**Form fields**:
| Field | Required | Type |
|---|---|---|
| `name` | yes | string |
| `series` | yes | string |
| `number` | yes | string |
| `description` | no | string |
| `rarity` | yes | enum |
| `condition` | yes | enum |
| `image` | no | file (jpg/png/webp, ≤5MB) |

**Response 201**: Full card object (same as GET /cards/:cardId).

**Response 400**: `{ "error": "Validation failed", "fields": { "name": "Required" } }`

---

## PUT /cards/:cardId

**Purpose**: Update card description, condition, or image (owner only).

**Content-Type**: `multipart/form-data`

**Editable form fields**:
| Field | Required | Notes |
|---|---|---|
| `description` | no | Replaces existing |
| `condition` | no | Replaces existing |
| `image` | no | Replaces existing image |

*`name`, `series`, `number`, `rarity` are immutable — ignored if sent.*

**Response 200**: Updated card object.

**Response 403**: `{ "error": "Not the card owner" }`
**Response 404**: `{ "error": "Card not found" }`

---

## DELETE /cards/:cardId

**Purpose**: Delete a card (owner only, not in pending trade).

**Response 204**: No body.

**Response 403**: `{ "error": "Not the card owner" }`
**Response 409**: `{ "error": "Card is part of a pending trade" }`

---

## GET /users/:userId/inventory

**Purpose**: List cards owned by a specific user.

**Query params**: Same as GET /cards (page, size, search, rarity, condition).

**Response 200**: Same shape as GET /cards.

**Note**: Used for both "My Inventory" (own userId) and "Public Profile" card
display (other userId).
