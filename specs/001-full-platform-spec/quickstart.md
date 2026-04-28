# Quickstart: Card Trading Platform Front-End

**Branch**: `001-full-platform-spec` | **Date**: 2026-04-28

This guide gets a new developer running and validates the implementation.

---

## Prerequisites

- Node.js 18+
- npm 9+ or yarn 1.22+
- The back-end API running and accessible (default: `http://localhost:8080`)

---

## Setup

```bash
# 1. Clone & install
git clone <repo-url>
cd FrontEnd
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env:
#   REACT_APP_API_BASE_URL=http://localhost:8080/api/v1

# 3. Start development server
npm start
# → http://localhost:3000
```

---

## Running Tests

```bash
# All tests
npm test

# With coverage report
npm test -- --coverage

# Single file
npm test -- Button.test.jsx
```

Coverage thresholds enforced:
- `components/common/`: 90%
- `services/`: 85%
- `hooks/`: 80%
- `utils/`: 100%

---

## Validation Checklist

After implementation, verify each feature works end-to-end:

### Authentication
- [ ] Register new account → redirects to Dashboard
- [ ] Login with valid credentials → Dashboard loads with user name in header
- [ ] Login with wrong password → error message appears, no redirect
- [ ] Logout → redirected to `/login`, protected routes inaccessible
- [ ] Refresh page while logged in → session restores silently (no re-login)
- [ ] Request password reset → confirmation message appears
- [ ] Reset token expiry → error message with "request again" prompt

### Card Management
- [ ] Open Inventory → own cards visible with image/placeholder, name, rarity, condition
- [ ] Search cards by name → list narrows correctly
- [ ] Filter by rarity → only matching rarity shown
- [ ] Create card without image → placeholder shown, card appears in Inventory
- [ ] Create card with 6MB image → error; upload blocked
- [ ] Edit card condition → updated value reflects in Inventory and Detail
- [ ] Edit card series field → field is read-only (disabled)
- [ ] Delete card not in trade → card removed from Inventory
- [ ] Delete card in pending trade → error message blocks deletion
- [ ] Open Catalog → cards from all users with owner usernames visible
- [ ] Click "Propose Trade" in Catalog → Trade creation opens with card pre-selected

### Trading
- [ ] Propose trade with 1 own card and 1 counterparty card → trade appears in My Trades as Pending
- [ ] Try to add 4th card on either side → "Maximum 3 cards per side" message
- [ ] Accept trade (as recipient) → both inventories update, status = Completed
- [ ] Reject trade (as recipient) → no card movement, status = Rejected
- [ ] Cancel trade (as initiator, pending) → status = Cancelled, cards freed
- [ ] Try to cancel completed trade → action blocked

### Profile
- [ ] View My Profile → avatar, username, bio, stats all correct
- [ ] Edit bio → updated bio visible on profile and public profile URL
- [ ] Change password with wrong current password → error message
- [ ] Change password correctly → success toast, still logged in
- [ ] View another user's public profile → email NOT visible, "Propose Trade" button visible
- [ ] View own public profile URL → "Propose Trade" button hidden

### Dashboard
- [ ] Login → Dashboard loads with correct stats (total cards, pending trades)
- [ ] Activity feed → last 10 own events in reverse chronological order
- [ ] Click "Add Card" quick action → navigates to Create Card form

### Admin (admin account required)
- [ ] Login as admin → Admin Dashboard accessible at `/admin`
- [ ] Non-admin navigates to `/admin` → redirected with Forbidden message
- [ ] Admin bans a user → user status changes to Banned, pending trades cancelled
- [ ] Admin views trade detail → full info visible (no accept/reject actions)

---

## Key File Locations

| What | Where |
|---|---|
| API instance + interceptors | `src/services/api.js` |
| Token storage | `src/services/storageService.js` |
| Auth state | `src/context/AuthContext.jsx` |
| Toast notifications | `src/context/NotificationContext.jsx` |
| Design tokens | `src/styles/theme.js` |
| Route definitions | `src/App.jsx` |
| Constants | `src/utils/constants.js` |
| Validators | `src/utils/validators.js` |

---

## Environment Variables

| Variable | Required | Example |
|---|---|---|
| `REACT_APP_API_BASE_URL` | yes | `http://localhost:8080/api/v1` |

---

## Common Issues

**"Network Error" on all API calls**
→ Check `REACT_APP_API_BASE_URL` in `.env` and that the back-end is running.

**Session lost on page refresh**
→ Verify the back-end sets the `httpOnly` refresh-token cookie with correct
`SameSite` and `Domain` settings. The silent refresh on app load calls
`POST /auth/refresh` with `withCredentials: true`.

**Images not uploading**
→ Ensure `multipart/form-data` requests are NOT overriding `Content-Type` — let
Axios set the boundary automatically by passing a `FormData` object.

**Admin route accessible to non-admin**
→ Verify `AuthContext.user.role` is populated correctly from the login response.
