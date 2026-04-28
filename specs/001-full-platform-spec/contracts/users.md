# API Contract: Users

**Base path**: `/api/v1/users`
**Service file**: `src/services/userService.js`

All requests require `Authorization: Bearer {accessToken}`.

---

## GET /users/:userId

**Purpose**: Get a user's profile. Returns public fields for any user.
Returns email only when `userId === authenticatedUser.id`.

**Response 200**:
```json
{
  "id": "uuid",
  "username": "trader42",
  "email": "user@example.com",  // only when own profile
  "avatarUrl": null,
  "bio": "Collecting since 2010.",
  "location": "Buenos Aires",
  "role": "user",
  "status": "active",
  "createdAt": "2025-01-01T00:00:00Z",
  "stats": {
    "totalCards": 24,
    "completedTrades": 11,
    "pendingTrades": 2,
    "rating": 4.8
  }
}
```

**Response 404**: `{ "error": "User not found" }`

---

## PUT /users/:userId

**Purpose**: Update profile (own profile only). Editable: avatarUrl, bio,
location. Username and email are immutable via this endpoint.

**Content-Type**: `multipart/form-data`

**Form fields**:
| Field | Required | Notes |
|---|---|---|
| `avatar` | no | File (jpg/png/webp, ≤5MB); replaces existing |
| `bio` | no | max 500 chars |
| `location` | no | max 100 chars |

**Response 200**: Updated user object.

**Response 403**: `{ "error": "Cannot update another user's profile" }`
