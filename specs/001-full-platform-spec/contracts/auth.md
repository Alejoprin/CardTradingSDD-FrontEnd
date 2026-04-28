# API Contract: Authentication

**Base path**: `/api/v1/auth`
**Service file**: `src/services/authService.js`

---

## POST /auth/login

**Purpose**: Authenticate user with email and password.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response 200**:
```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "uuid",
    "username": "trader42",
    "email": "user@example.com",
    "avatarUrl": null,
    "role": "user",
    "status": "active"
  }
}
```
*Refresh token delivered via `httpOnly` Set-Cookie header — not in body.*

**Response 401**: `{ "error": "Invalid credentials" }`

**Front-end action**: Store `accessToken` in-memory via `storageService.setTokens`. Update `AuthContext`. Redirect to `/dashboard`.

---

## POST /auth/register

**Purpose**: Create a new user account.

**Request**:
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "secret123"
}
```

**Response 201**:
```json
{
  "accessToken": "eyJ...",
  "user": { /* same as login */ }
}
```

**Response 409**: `{ "error": "Email already registered" }` or `{ "error": "Username taken" }`

**Front-end action**: Same as login success — store token, update context, redirect to `/dashboard`.

---

## POST /auth/logout

**Purpose**: Invalidate the current session server-side.

**Request**: Empty body. Sends cookie automatically.

**Response 200**: `{ "message": "Logged out" }`

**Front-end action**: Call `storageService.clearTokens()`, reset `AuthContext`, redirect to `/login`.

---

## POST /auth/refresh

**Purpose**: Exchange refresh token (from httpOnly cookie) for a new access token.

**Request**: Empty body. Cookie sent automatically with `withCredentials: true`.

**Response 200**:
```json
{ "accessToken": "eyJ..." }
```

**Response 401**: `{ "error": "Refresh token expired or invalid" }`

**Front-end action**: On success, store new access token. On failure, logout.

---

## POST /auth/password/reset

**Purpose**: Request a password-reset email.

**Request**:
```json
{ "email": "user@example.com" }
```

**Response 200**: `{ "message": "Reset email sent if account exists" }`
*(Always 200 — no email enumeration)*

---

## POST /auth/password/reset/confirm

**Purpose**: Set a new password using the reset token received by email.

**Request**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newsecret123"
}
```

**Response 200**: `{ "message": "Password updated" }`
**Response 400**: `{ "error": "Token invalid or expired" }`

**Front-end action**: On success, redirect to `/login`.

---

## POST /auth/password/change

**Purpose**: Change password for an authenticated user.

**Headers**: `Authorization: Bearer {accessToken}`

**Request**:
```json
{
  "currentPassword": "oldsecret",
  "newPassword": "newsecret123"
}
```

**Response 200**: `{ "message": "Password changed" }`
**Response 401**: `{ "error": "Current password incorrect" }`

**Front-end action**: Show success toast, stay logged in, redirect to `/profile`.
