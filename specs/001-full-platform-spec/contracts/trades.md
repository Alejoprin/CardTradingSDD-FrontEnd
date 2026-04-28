# API Contract: Trades

**Base path**: `/api/v1/trades`
**Service file**: `src/services/tradeService.js`

All requests require `Authorization: Bearer {accessToken}`.

---

## GET /trades

**Purpose**: List all trades involving the authenticated user (as initiator or
counterparty).

**Query params**:
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number |
| `size` | int | 12 | Items per page |
| `status` | string | — | Filter: pending, completed, rejected, cancelled |

**Response 200**:
```json
{
  "trades": [
    {
      "id": "uuid",
      "initiatorId": "uuid",
      "initiatorUsername": "trader42",
      "initiatorAvatarUrl": null,
      "counterpartyId": "uuid",
      "counterpartyUsername": "collector99",
      "counterpartyAvatarUrl": null,
      "status": "pending",
      "offeredCardsCount": 2,
      "requestedCardsCount": 1,
      "createdAt": "2026-04-01T00:00:00Z",
      "updatedAt": "2026-04-01T00:00:00Z"
    }
  ],
  "pagination": { /* standard pagination */ }
}
```

---

## GET /trades/:tradeId

**Purpose**: Get full details of a single trade (both parties only).

**Response 200**:
```json
{
  "id": "uuid",
  "initiatorId": "uuid",
  "initiatorUsername": "trader42",
  "initiatorAvatarUrl": null,
  "counterpartyId": "uuid",
  "counterpartyUsername": "collector99",
  "counterpartyAvatarUrl": null,
  "status": "pending",
  "offeredCards": [ /* full Card objects */ ],
  "requestedCards": [ /* full Card objects */ ],
  "createdAt": "2026-04-01T00:00:00Z",
  "updatedAt": "2026-04-01T00:00:00Z",
  "timeline": [
    {
      "event": "created",
      "timestamp": "2026-04-01T00:00:00Z",
      "actorUsername": "trader42"
    }
  ]
}
```

**Response 403**: `{ "error": "Not a party to this trade" }`
**Response 404**: `{ "error": "Trade not found" }`

---

## POST /trades

**Purpose**: Create a new trade proposal.

**Request**:
```json
{
  "counterpartyUserId": "uuid",
  "offeredCardIds": ["uuid1", "uuid2"],
  "requestedCardIds": ["uuid3"]
}
```

**Validation**:
- `offeredCardIds`: 1–3 items, all owned by authenticated user.
- `requestedCardIds`: 1–3 items, all owned by `counterpartyUserId`.
- `counterpartyUserId` must not equal authenticated user's id.

**Response 201**: Full trade object.

**Response 400**: `{ "error": "Validation failed", "fields": { ... } }`
**Response 409**: `{ "error": "One or more cards are in a pending trade" }`

---

## PUT /trades/:tradeId/accept

**Purpose**: Accept a pending trade (counterparty only). Transfers card
ownership atomically.

**Request**: Empty body.

**Response 200**: Updated trade object with `status: "completed"`.

**Response 403**: `{ "error": "Only the counterparty can accept" }`
**Response 409**: `{ "error": "Trade is no longer pending" }`

---

## PUT /trades/:tradeId/reject

**Purpose**: Reject a pending trade (counterparty only).

**Request**:
```json
{}
```
*(Body is optional — no rejection reason required in this spec.)*

**Response 200**: Updated trade object with `status: "rejected"`.

**Response 403**: `{ "error": "Only the counterparty can reject" }`
**Response 409**: `{ "error": "Trade is no longer pending" }`

---

## DELETE /trades/:tradeId

**Purpose**: Cancel a pending trade (initiator only).

**Response 200**: Updated trade object with `status: "cancelled"`.

**Response 403**: `{ "error": "Only the initiator can cancel" }`
**Response 409**: `{ "error": "Trade is no longer pending" }`
