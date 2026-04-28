# Feature Specification: Card Trading Platform — Full Feature Set

**Feature Branch**: `001-full-platform-spec`
**Created**: 2026-04-28
**Status**: Draft
**Modules**: Authentication · Cards · Trading · Profile · Dashboard · Administration

---

## Clarifications

### Session 2026-04-28

- Q: Maximum number of cards allowed on each side of a trade proposal → A: Up to 3 cards per side.
- Q: When an admin bans a user, what happens to their pending trades? → A: Auto-cancel all pending trades involving the banned user immediately.
- Q: Activity feed scope on Dashboard — own events or platform-wide? → A: Own events only (cards added, trades sent/received/accepted/rejected/cancelled by the logged-in user).
- Q: What fallback is displayed for cards without an uploaded image? → A: Generic placeholder image (card-shaped grey box with an icon), consistent across all card displays.
- Q: How does a user learn about trade status changes (accept/reject) without real-time push? → A: Manual refresh only — no polling. Users check My Trades to see current status.

---

## User Scenarios & Testing *(mandatory)*

This specification covers 26 independently deliverable features across 6 modules.
Each module groups related user stories. Stories within a module are ordered by
delivery priority.

---

### MODULE A — AUTHENTICATION

---

### User Story A1 — User Login (Priority: P1)

A registered user enters their email and password on the login page and gains
access to the platform. On success they are redirected to the Dashboard. On
failure they see a clear error message without revealing which field is wrong.

**Why this priority**: All other platform features require an authenticated
session. Login is the entry gate.

**Independent Test**: Navigate to `/login`, enter valid credentials, confirm
redirect to Dashboard and that the user's name appears in the header.

**Acceptance Scenarios**:

1. **Given** a registered user, **When** they submit correct email + password,
   **Then** they are redirected to the Dashboard and their session is active.
2. **Given** a registered user, **When** they submit an incorrect password,
   **Then** an error message appears and no session is created.
3. **Given** an already-logged-in user, **When** they visit `/login`,
   **Then** they are redirected to the Dashboard.
4. **Given** a user, **When** they submit empty fields,
   **Then** inline validation errors appear before the form is submitted.

---

### User Story A2 — User Registration (Priority: P1)

A new visitor creates an account by providing a unique username, valid email,
and password. After successful registration the user is automatically logged in
and redirected to the Dashboard.

**Why this priority**: Registration is the prerequisite for all user activity.

**Independent Test**: Complete the registration form with unique data, confirm
auto-login and redirect to Dashboard.

**Acceptance Scenarios**:

1. **Given** unique email + username + valid password, **When** submitted,
   **Then** account is created, user is logged in, and redirected to Dashboard.
2. **Given** an email already registered, **When** submitted,
   **Then** an error indicates the email is taken (username not revealed).
3. **Given** mismatched password and confirm-password, **When** submitted,
   **Then** a validation error appears before submission.
4. **Given** a password shorter than 8 characters, **When** submitted,
   **Then** a validation error appears before submission.

---

### User Story A3 — Password Reset (Priority: P2)

A user who forgot their password requests a reset link via email. After
following the link they set a new password and are redirected to the login page.

**Why this priority**: Needed to prevent permanent account lockouts. Lower than
login/register because it is an infrequent flow.

**Independent Test**: Request reset for a known email, simulate token arrival,
set new password, confirm login with new password succeeds.

**Acceptance Scenarios**:

1. **Given** a valid registered email, **When** reset is requested,
   **Then** the user sees a confirmation message (link sent).
2. **Given** an unregistered email, **When** reset is requested,
   **Then** the same confirmation message appears (no enumeration).
3. **Given** a valid reset token, **When** the user submits a new password,
   **Then** the password is updated and user is redirected to login.
4. **Given** an expired or invalid token, **When** the user submits,
   **Then** an error is shown and the user is prompted to request again.

---

### User Story A4 — Logout (Priority: P1)

A logged-in user clicks the logout action and their session is terminated
immediately. They are redirected to the login page and cannot access protected
routes without re-authenticating.

**Why this priority**: Security baseline — must ship alongside login.

**Independent Test**: Log in, click logout, confirm redirect to `/login`,
confirm that navigating to a protected route redirects back to `/login`.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they click Logout,
   **Then** session is cleared and they land on `/login`.
2. **Given** a logged-out user, **When** they navigate to any protected route,
   **Then** they are redirected to `/login`.
3. **Given** a logged-in user on a shared device, **When** they logout,
   **Then** no sensitive data remains accessible in the browser tab.

---

### User Story A5 — Automatic Token Refresh (Priority: P1)

The user's session stays alive while they are actively using the platform
without requiring them to log in again. When the access token is near expiry
a new one is obtained silently in the background.

**Why this priority**: Without this, users would be logged out mid-action,
breaking flows like trade proposal submission.

**Independent Test**: Simulate token expiry during an API call; confirm the
call succeeds after transparent refresh and the user sees no interruption.

**Acceptance Scenarios**:

1. **Given** a valid refresh token, **When** the access token expires,
   **Then** a new access token is obtained silently and the pending request
   retries successfully.
2. **Given** an expired refresh token, **When** any authenticated request is
   made, **Then** the user is redirected to `/login` with a session-expired
   message.
3. **Given** a failed refresh attempt (network error), **When** the user
   triggers a request, **Then** an error message is shown and the user can
   retry or log in again.

---

### MODULE B — CARD MANAGEMENT

---

### User Story B1 — View My Inventory (Priority: P1)

A logged-in user sees all their cards in a paginated gallery. They can search
by name, filter by rarity and condition, and switch between grid and list views.
Each card shows its thumbnail, name, rarity badge, and condition.

**Why this priority**: Core utility of the platform; needed to propose trades.

**Independent Test**: Log in as a user with cards, navigate to Inventory,
confirm cards appear with correct data, apply a filter and confirm results
narrow correctly.

**Acceptance Scenarios**:

1. **Given** a user with cards, **When** they open Inventory,
   **Then** all their cards are listed with thumbnail, name, rarity, and
   condition.
2. **Given** cards in Inventory, **When** the user searches by name,
   **Then** only matching cards are shown.
3. **Given** cards in Inventory, **When** the user filters by rarity,
   **Then** only cards of that rarity are shown.
4. **Given** more cards than fit on one page, **When** the user navigates
   pages, **Then** the correct cards appear on each page.
5. **Given** a user with no cards, **When** they open Inventory,
   **Then** an empty state with a "Add your first card" prompt is shown.

---

### User Story B2 — Explore Card Catalog (Priority: P1)

Any logged-in user can browse all cards registered by all users on the platform.
Each card shows its thumbnail, name, rarity, condition, and the username of its
owner. From a card in the catalog the user can navigate to propose a trade with
the owner.

**Why this priority**: Enables discovery and is the entry point for proposing
trades with other users.

**Independent Test**: Log in, navigate to Catalog, confirm cards from other
users are visible with owner info, click "Propose Trade" from a card and confirm
the Trade form opens pre-filled with that card.

**Acceptance Scenarios**:

1. **Given** multiple users with cards, **When** any user opens the Catalog,
   **Then** all cards from all users are displayed (including the viewer's own).
2. **Given** cards in the Catalog, **When** the user searches by name,
   **Then** only matching cards appear.
3. **Given** a card belonging to another user, **When** the user clicks
   "Propose Trade", **Then** the trade creation flow opens with that card
   pre-selected as the desired card.
4. **Given** the Catalog, **When** the user filters by rarity or condition,
   **Then** results narrow accordingly.

---

### User Story B3 — View Card Detail (Priority: P2)

A user can open a card's detail page to see its full information: large image,
name, series, number, description, rarity, condition, current owner's username
and avatar, and a list of past trades that involved this card.

**Why this priority**: Supports informed trade decisions; depends on B1/B2.

**Independent Test**: Navigate to a card's detail URL, confirm all fields
display, confirm owner info links to their public profile.

**Acceptance Scenarios**:

1. **Given** any card ID, **When** the user navigates to its detail page,
   **Then** all card fields are displayed accurately.
2. **Given** a card with completed trades, **When** the user views the detail,
   **Then** the trade history (dates, counterparts) is visible.
3. **Given** a card owned by another user, **When** the viewer opens detail,
   **Then** owner info is shown and a "Propose Trade" button is available.
4. **Given** a card owned by the viewer, **When** they open detail,
   **Then** Edit and Delete actions are shown instead of "Propose Trade".

---

### User Story B4 — Create Card (Priority: P1)

A logged-in user adds a new card to their inventory by filling in: name, series,
card number, description, rarity (common/rare/epic/legendary), condition
(mint/near-mint/good/fair/poor), and optionally uploading an image.

**Why this priority**: Populates inventory without which trades cannot happen.

**Independent Test**: Complete the Create Card form with valid data, submit,
confirm the card appears in Inventory with correct data.

**Acceptance Scenarios**:

1. **Given** valid card data, **When** the form is submitted,
   **Then** the card is created and appears in the user's Inventory.
2. **Given** missing required fields (name, series, number, rarity, condition),
   **When** the form is submitted,
   **Then** inline validation errors highlight the missing fields.
3. **Given** an image file within size limits, **When** uploaded,
   **Then** a preview appears and the image is stored with the card.
4. **Given** an image exceeding the size limit, **When** uploaded,
   **Then** an error message appears and the upload is rejected.

---

### User Story B5 — Edit Card (Priority: P2)

The owner of a card can modify its description, condition, and image. Series and
card number are read-only identifiers and cannot be changed. Changes are saved
immediately upon form submission.

**Why this priority**: Maintenance feature; depends on B4.

**Independent Test**: Edit a card's condition field, save, confirm the updated
value appears in Inventory and on the Detail page.

**Acceptance Scenarios**:

1. **Given** the card owner, **When** they update the condition and save,
   **Then** the new value is reflected immediately.
2. **Given** the card owner, **When** they try to change series or number,
   **Then** those fields are disabled and cannot be modified.
3. **Given** a non-owner, **When** they navigate to the edit URL,
   **Then** they see a "Not authorized" message and cannot submit changes.
4. **Given** invalid data (e.g., empty required field), **When** submitted,
   **Then** validation errors appear and no change is saved.

---

### User Story B6 — Delete Card (Priority: P2)

The owner of a card can permanently delete it from their inventory after
confirming a dialog. A card that is part of an active (pending) trade cannot
be deleted until the trade is resolved.

**Why this priority**: Maintenance feature; lower priority since it is
destructive.

**Independent Test**: Delete a card not involved in a trade, confirm it
disappears from Inventory. Attempt to delete a card in a pending trade, confirm
the action is blocked with a clear message.

**Acceptance Scenarios**:

1. **Given** a card not in a pending trade, **When** the user confirms
   deletion, **Then** the card is removed from Inventory permanently.
2. **Given** a card involved in a pending trade, **When** the user attempts
   deletion, **Then** a blocking message explains the card must be removed from
   the trade first.
3. **Given** the deletion confirmation dialog, **When** the user cancels,
   **Then** no deletion occurs.
4. **Given** a non-owner, **When** they attempt to delete a card,
   **Then** the action is blocked.

---

### MODULE C — TRADING

---

### User Story C1 — View My Trades (Priority: P1)

A logged-in user sees a list of all trades they are involved in (as proposer or
recipient). Trades are grouped by status: Pending, Completed, Rejected,
Cancelled. Each entry shows a summary of cards exchanged and the counterpart's
username.

**Why this priority**: Central trade management view; required for all trade
lifecycle actions.

**Independent Test**: Create a trade, navigate to My Trades, confirm the trade
appears under "Pending" with correct counterpart and card summary.

**Acceptance Scenarios**:

1. **Given** a user with trades in multiple states, **When** they open My
   Trades, **Then** trades appear grouped by status.
2. **Given** trades under "Pending", **When** the user is the recipient,
   **Then** Accept and Reject actions are visible on each pending trade.
3. **Given** trades under "Pending", **When** the user is the proposer,
   **Then** a Cancel action is visible on each pending trade.
4. **Given** a user with no trades, **When** they open My Trades,
   **Then** an empty state with a "Propose your first trade" prompt is shown.

---

### User Story C2 — Propose Trade (Priority: P1)

A logged-in user creates a trade offer by selecting one or more cards from their
own inventory to offer, and one or more cards from another user's inventory to
request. They review the proposal summary before submitting.

**Why this priority**: Core platform action — without trade creation the
platform has no exchanges.

**Independent Test**: Select one own card and one card from another user,
review summary, submit; confirm the trade appears in My Trades as "Pending" and
is visible to the recipient.

**Acceptance Scenarios**:

1. **Given** at least one card on each side, **When** the user submits,
   **Then** a pending trade is created and both parties see it.
2. **Given** no cards selected on the "offer" side, **When** submitted,
   **Then** a validation error prevents submission.
3. **Given** the user tries to add a 4th card to either side, **When** they
   attempt the selection, **Then** a validation message blocks it:
   "Maximum 3 cards per side".
4. **Given** a card already in a pending trade, **When** the user tries to
   include it, **Then** a warning is shown (card may be unavailable).
4. **Given** the user tries to propose a trade with themselves, **When**
   submitted, **Then** an error blocks the action.

---

### User Story C3 — View Trade Detail (Priority: P2)

A user involved in a trade can view its detail page: both sets of cards
(offered and requested with images), the other party's username and avatar,
the current status, and a timeline of status changes.

**Why this priority**: Supports informed accept/reject decisions; depends on C1.

**Independent Test**: Navigate to a trade's detail URL, confirm both card sets
are shown, counterpart info is accurate, and the status timeline is correct.

**Acceptance Scenarios**:

1. **Given** a trade ID, **When** an involved user views its detail,
   **Then** all cards on both sides, the counterpart's info, status, and
   timeline are displayed.
2. **Given** a pending trade viewed by the recipient, **When** they open
   detail, **Then** Accept and Reject actions are available.
3. **Given** a non-involved user, **When** they navigate to the trade URL,
   **Then** they see a "Not authorized" message.

---

### User Story C4 — Accept Trade (Priority: P1)

The recipient of a pending trade can accept it. Upon acceptance, cards change
ownership: the recipient receives the offered cards and the proposer receives
the requested cards. Both inventories are updated atomically and both parties
are notified.

**Why this priority**: Completing exchanges is the core value of the platform.

**Independent Test**: Accept a pending trade as the recipient, confirm cards
moved to the correct inventories, and the trade status shows "Completed".

**Acceptance Scenarios**:

1. **Given** a pending trade, **When** the recipient accepts,
   **Then** cards transfer, trade status becomes "Completed", both inventories
   update.
2. **Given** a cancelled or already-completed trade, **When** any user attempts
   to accept, **Then** the action is blocked.
3. **Given** the proposer, **When** they try to accept their own trade,
   **Then** the action is blocked.
4. **Given** acceptance confirmation dialog, **When** the user cancels,
   **Then** no action occurs.

---

### User Story C5 — Reject Trade (Priority: P1)

The recipient of a pending trade can reject it. No cards change ownership.
The trade status becomes "Rejected" and the proposer can see the updated status.

**Why this priority**: Must ship alongside Accept — users need both options.

**Independent Test**: Reject a pending trade as the recipient, confirm no cards
moved, trade status shows "Rejected".

**Acceptance Scenarios**:

1. **Given** a pending trade, **When** the recipient rejects,
   **Then** trade status becomes "Rejected" and no cards transfer.
2. **Given** a non-recipient, **When** they attempt to reject,
   **Then** the action is blocked.
3. **Given** a rejection confirmation dialog, **When** the user cancels,
   **Then** no action occurs.

---

### User Story C6 — Cancel Trade (Priority: P2)

The proposer of a pending trade can cancel it before it is accepted or rejected.
The trade status becomes "Cancelled" and all involved cards are freed.

**Why this priority**: Allows proposers to retract offers; depends on C2.

**Independent Test**: Cancel a pending trade as the proposer, confirm status
shows "Cancelled" and the involved cards are available again.

**Acceptance Scenarios**:

1. **Given** a pending trade, **When** the proposer cancels,
   **Then** trade status becomes "Cancelled" and cards are freed.
2. **Given** a completed or rejected trade, **When** any user attempts to
   cancel, **Then** the action is blocked.
3. **Given** the recipient, **When** they try to cancel the trade,
   **Then** the action is blocked (Cancel is proposer-only).

---

### MODULE D — USER PROFILE

---

### User Story D1 — View My Profile (Priority: P2)

A logged-in user can view their own profile page: avatar, username, email, bio,
location, and activity statistics (total cards, completed trades, pending
trades). The page includes buttons for Edit Profile, Change Password, and
Logout.

**Why this priority**: Secondary to core trading flow but needed for identity
and account management.

**Independent Test**: Navigate to My Profile, confirm all fields display correct
values matching account data.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they navigate to My Profile,
   **Then** all their data and statistics are displayed accurately.
2. **Given** the profile page, **When** the user clicks Edit Profile,
   **Then** the Edit Profile form opens.
3. **Given** the profile page, **When** the user clicks Logout,
   **Then** the session is terminated and they are redirected to `/login`.

---

### User Story D2 — Edit My Profile (Priority: P2)

A logged-in user can update their avatar (upload new image), bio, and location.
Username and email are not editable from this form. Changes are persisted on
save.

**Why this priority**: Improves trust and community; not blocking core flows.

**Independent Test**: Update bio text, save, confirm the new bio appears on My
Profile and on the Public Profile view.

**Acceptance Scenarios**:

1. **Given** new bio text, **When** saved, **Then** bio updates on profile.
2. **Given** a new avatar image within size limits, **When** uploaded and saved,
   **Then** the new avatar appears across the platform.
3. **Given** the edit form, **When** the user attempts to modify the username
   field, **Then** the field is read-only.
4. **Given** invalid data (bio over character limit), **When** submitted,
   **Then** a validation error appears.

---

### User Story D3 — Change Password (Priority: P2)

A logged-in user can change their password by providing the current password,
a new password, and confirming the new password. On success a confirmation
message is shown. The user is not logged out.

**Why this priority**: Security maintenance feature; not blocking core flows.

**Independent Test**: Change password with valid current password and valid new
password, confirm success message, log out, log in with new password.

**Acceptance Scenarios**:

1. **Given** correct current password + valid new password, **When** submitted,
   **Then** password is updated and a success message is shown.
2. **Given** incorrect current password, **When** submitted,
   **Then** an error indicates the current password is wrong.
3. **Given** new password shorter than 8 characters, **When** submitted,
   **Then** a validation error appears.
4. **Given** mismatched new password and confirmation, **When** submitted,
   **Then** a validation error appears.

---

### User Story D4 — View Public Profile (Priority: P2)

Any logged-in user can view another user's public profile: avatar, username,
bio, location, public stats (completed trades, total cards), and a gallery of
the user's cards available for trading. A "Propose Trade" button is visible if
the viewer is not the profile owner.

**Why this priority**: Builds trust before trade; depends on D1 data model.

**Independent Test**: Navigate to another user's public profile URL, confirm
public data is shown, confirm email is not visible, confirm "Propose Trade"
button is present.

**Acceptance Scenarios**:

1. **Given** any user's profile URL, **When** another user visits it,
   **Then** avatar, username, bio, location, stats, and available cards are
   shown.
2. **Given** a user viewing their own public profile URL,
   **When** they visit it, **Then** the "Propose Trade" button is hidden.
3. **Given** another user's profile, **When** the viewer clicks
   "Propose Trade", **Then** the trade creation flow opens with the owner
   pre-selected.
4. **Given** any public profile, **When** viewed,
   **Then** the user's email is NOT displayed.

---

### MODULE E — DASHBOARD

---

### User Story E1 — Main Dashboard (Priority: P1)

Upon login, the authenticated user lands on the Dashboard. It shows:
- **Stats bar**: total cards in inventory, pending trades, completed trades.
- **Quick actions**: "Add Card", "Explore Catalog", "View My Trades".
- **Recent activity feed**: last 10 actions (card added, trade proposed,
  trade accepted/rejected/cancelled) with timestamps.

**Why this priority**: First screen after login; sets the tone for the full
experience.

**Independent Test**: Log in, confirm the Dashboard loads with accurate stats
and the activity feed reflects recent actions.

**Acceptance Scenarios**:

1. **Given** a user with activity, **When** they log in,
   **Then** stats reflect current inventory and trade counts.
2. **Given** a new user with no activity, **When** they log in,
   **Then** all stats show zero and a "Get started" empty state is shown.
3. **Given** the Dashboard, **When** the user clicks "Add Card",
   **Then** they are navigated to the Create Card form.
4. **Given** the activity feed, **When** there are recent events,
   **Then** events are listed in reverse chronological order with timestamps.

---

### MODULE F — ADMINISTRATION

---

### User Story F1 — Admin Dashboard (Priority: P3)

An admin user sees a KPI dashboard with: total registered users, total cards,
total trades, users active today, and trades completed today. KPIs are displayed
as stat cards with trend indicators (vs yesterday).

**Why this priority**: Operational visibility; admin-only and not blocking user
flows.

**Independent Test**: Log in as admin, navigate to Admin Dashboard, confirm
KPIs are non-zero and match system totals.

**Acceptance Scenarios**:

1. **Given** an admin user, **When** they open Admin Dashboard,
   **Then** accurate system-wide KPIs are displayed.
2. **Given** a non-admin user, **When** they navigate to the Admin area,
   **Then** they receive a "Forbidden" message and are redirected.
3. **Given** KPI cards, **When** today's count is higher than yesterday's,
   **Then** a positive trend indicator is shown.

---

### User Story F2 — User Management (Priority: P3)

An admin can list all registered users in a paginated table (username, email,
registration date, total cards, total trades, status). They can search by
username or email, filter by status (active/banned), view a user's detail, and
ban a user after confirming a dialog.

**Why this priority**: Moderation capability; admin-only.

**Independent Test**: Search for a specific user by email, view their detail,
ban them, confirm their status changes to "Banned" in the list.

**Acceptance Scenarios**:

1. **Given** the admin, **When** they search by username,
   **Then** only matching users appear.
2. **Given** the admin, **When** they click Ban on a user and confirm,
   **Then** the user's status changes to "Banned" and they can no longer log in.
3. **Given** the admin, **When** they filter by "Banned",
   **Then** only banned users appear.
4. **Given** a non-admin, **When** they access this page,
   **Then** they are blocked and redirected.

---

### User Story F3 — Trade Management (Priority: P3)

An admin can view all trades in the system in a paginated table (trade ID,
proposer, recipient, status, date, card counts). They can search by username,
filter by status, and view any trade's detail page for dispute investigation.

**Why this priority**: Compliance and moderation; admin-only.

**Independent Test**: Search trades by a specific user, filter by "Pending",
open a trade detail and confirm full information is displayed.

**Acceptance Scenarios**:

1. **Given** the admin, **When** they search trades by username,
   **Then** only trades involving that user appear.
2. **Given** the admin, **When** they filter by status,
   **Then** only trades with that status appear.
3. **Given** any trade, **When** the admin views its detail,
   **Then** complete information is shown (cards, parties, timeline).
4. **Given** a non-admin, **When** they access this page,
   **Then** they are blocked and redirected.

---

### User Story F4 — System Statistics (Priority: P3)

An admin can view charts showing: new users per day/week/month, cards by rarity
breakdown (pie), trades by status (bar), and trade acceptance/rejection rates
over time. The time period is configurable. Data can be exported as CSV.

**Why this priority**: Analytics and reporting; admin-only; lowest priority.

**Independent Test**: Navigate to System Stats, change period to "last 7 days",
confirm charts update, export CSV and verify it contains data rows.

**Acceptance Scenarios**:

1. **Given** the admin, **When** they select a time period,
   **Then** all charts update to reflect data for that period.
2. **Given** the stats page, **When** the admin clicks Export CSV,
   **Then** a CSV file is downloaded with correct column headers and data.
3. **Given** a period with no data, **When** selected,
   **Then** charts show empty states with a clear "No data for this period"
   message.

---

### Edge Cases

- What happens when a user's account is banned mid-session? → Their next API
  call returns 401/403, triggering logout and a "Your account has been suspended"
  message.
- What happens to pending trades when a user is banned? → All pending trades
  involving the banned user (as proposer or recipient) are automatically
  cancelled. Counterpart cards are freed immediately.
- What happens if the image upload fails during card creation? → The card is not
  created. The form remains filled so the user can retry.
- What happens if two users simultaneously accept the same trade? → The backend
  enforces atomicity; the second accept returns an error and the UI shows
  "This trade is no longer available".
- What happens if the network drops during trade acceptance? → The request is
  retried once transparently; on second failure the user sees an error toast and
  the trade remains in its previous state.
- What happens if a card is deleted while it is in the "offered" side of a
  pending trade? → The backend blocks deletion; the UI shows the blocking
  message.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication
- **FR-A01**: System MUST allow registered users to log in with email and
  password.
- **FR-A02**: System MUST validate credentials and return a session token on
  success.
- **FR-A03**: System MUST display a generic error for invalid credentials
  (no field enumeration).
- **FR-A04**: System MUST allow new users to register with unique email,
  unique username, and password.
- **FR-A05**: System MUST automatically log in the user after successful
  registration.
- **FR-A06**: System MUST send a password-reset email to registered addresses.
- **FR-A07**: System MUST invalidate reset tokens after use or expiry.
- **FR-A08**: System MUST clear all session data on logout.
- **FR-A09**: System MUST redirect unauthenticated users to `/login`.
- **FR-A10**: System MUST transparently refresh access tokens before expiry.
- **FR-A11**: System MUST redirect to `/login` when the refresh token is expired.

#### Card Management
- **FR-B01**: System MUST allow logged-in users to view their own cards with
  search, filter (rarity, condition), and pagination.
- **FR-B02**: System MUST display all cards from all users in the Catalog with
  search and filter.
- **FR-B03**: System MUST show the owner's username on catalog cards.
- **FR-B04**: System MUST display a card's full detail: image, name, series,
  number, description, rarity, condition, owner, trade history.
- **FR-B05**: System MUST allow users to create cards with: name (required),
  series (required), number (required), description, rarity (required),
  condition (required), image (optional). When no image is provided, a generic
  placeholder image (card-shaped grey box with an icon) MUST be displayed
  consistently across all card views (Inventory, Catalog, Trade detail, Card
  detail).
- **FR-B06**: System MUST allow card owners to edit: description, condition,
  image. Series and number MUST be read-only.
- **FR-B07**: System MUST allow card owners to delete cards not in a pending
  trade.
- **FR-B08**: System MUST block deletion of cards involved in pending trades.

#### Trading
- **FR-C01**: System MUST allow users to create trade proposals specifying
  offered cards (own) and requested cards (other user's). Each side MUST
  accept a minimum of 1 and a maximum of 3 cards.
- **FR-C02**: System MUST list a user's trades grouped by status.
- **FR-C03**: System MUST show full trade detail to both involved parties.
- **FR-C04**: System MUST allow the trade recipient to accept a pending trade,
  transferring card ownership atomically.
- **FR-C05**: System MUST allow the trade recipient to reject a pending trade.
- **FR-C06**: System MUST allow the trade proposer to cancel a pending trade.
- **FR-C07**: System MUST block accepting, rejecting, or cancelling resolved
  trades (completed/rejected/cancelled).
- **FR-C08**: System MUST prevent users from proposing trades with themselves.

#### Profile
- **FR-D01**: System MUST show the logged-in user's profile with avatar,
  username, email, bio, location, and activity stats.
- **FR-D02**: System MUST allow users to update avatar, bio, and location.
- **FR-D03**: System MUST allow users to change their password with current
  password verification.
- **FR-D04**: System MUST show any user's public profile (excluding email) with
  their available cards.

#### Dashboard
- **FR-E01**: System MUST display current stats (total cards, pending trades,
  completed trades) on the Dashboard.
- **FR-E02**: System MUST display a recent activity feed showing the last 10
  events belonging to the logged-in user only. Event types: card added, card
  edited, card deleted, trade proposed, trade received, trade accepted, trade
  rejected, trade cancelled.
- **FR-E03**: System MUST provide quick-action links to Create Card, Catalog,
  and My Trades.

#### Administration
- **FR-F01**: System MUST restrict admin routes to users with admin role.
- **FR-F02**: System MUST display system-wide KPIs on the Admin Dashboard.
- **FR-F03**: System MUST allow admins to list, search, filter, and ban users.
  Upon banning, the system MUST automatically cancel all pending trades
  involving the banned user and free associated cards.
- **FR-F04**: System MUST allow admins to list, search, filter, and view all
  trades.
- **FR-F05**: System MUST display system statistics charts with configurable
  time periods.
- **FR-F06**: System MUST allow admins to export statistics as CSV.

### Key Entities

- **User**: id, username (unique), email (unique), password (hashed), avatar URL,
  bio, location, role (user/admin), status (active/banned), created_at.
- **Card**: id, owner_id (User), name, series, number, description,
  rarity (common/rare/epic/legendary), condition (mint/near-mint/good/fair/poor),
  image URL, created_at, updated_at.
- **Trade**: id, proposer_id (User), recipient_id (User),
  status (pending/completed/rejected/cancelled), created_at, updated_at.
- **TradeCard**: trade_id, card_id, side (offered/requested).
- **Activity**: id, user_id, event_type (card_added | card_edited | card_deleted
  | trade_proposed | trade_received | trade_accepted | trade_rejected |
  trade_cancelled), metadata (JSON: card_id or trade_id reference), created_at.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-01**: A registered user can complete the login flow in under 30 seconds
  on a standard connection.
- **SC-02**: A new user can complete registration in under 2 minutes.
- **SC-03**: A user can add a new card (with image) in under 3 minutes.
- **SC-04**: A user can propose a trade from the Catalog in under 2 minutes.
- **SC-05**: The Inventory and Catalog pages load within 2 seconds for up to
  100 cards.
- **SC-06**: Trade acceptance completes (cards transfer) within 3 seconds of
  user confirmation.
- **SC-07**: 95% of form validation errors are surfaced inline before server
  submission.
- **SC-08**: Admin KPI dashboard loads within 3 seconds for a system with up to
  10,000 users.
- **SC-09**: Token refresh is transparent: users experience zero forced logouts
  due to token expiry during active sessions.
- **SC-10**: All protected routes redirect unauthenticated users to `/login`
  within 1 second.

---

## Assumptions

- Users have stable internet connectivity (no offline mode required).
- The back-end API is already implemented and returns the data structures
  described in the Key Entities section.
- Image uploads are handled by the API; the front-end sends a multipart form
  request. Maximum image size is 5 MB.
- The API uses JWT access tokens (short-lived) and refresh tokens (long-lived
  via httpOnly cookie).
- Role-based access control (admin vs user) is enforced by the back-end; the
  front-end enforces it for UX only.
- Email delivery (reset password) is handled by the back-end; the front-end
  only triggers the request and confirms the action.
- Notifications to trade counterparts (accept, reject) are handled by the
  back-end. The front-end does NOT implement polling or WebSocket notifications.
  Users discover trade status changes by navigating to My Trades and loading
  the current state. Real-time updates are explicitly out of scope.
- The admin role is assigned directly in the database; there is no admin
  self-registration UI.
- Mobile support means responsive design down to 480px; native apps are out
  of scope.
- Social login, 2FA, biometrics, email verification, and CAPTCHA are explicitly
  out of scope.
- Trade cancellation is available only to the proposer while the trade is
  pending.
- Series and card number together serve as the card's natural identifier; they
  are immutable once created.
