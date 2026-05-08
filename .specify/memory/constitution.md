<!--
  Sync Impact Report
  ===================
  Version change: 0.0.0 → 1.0.0 (MAJOR — initial ratification)
  Modified principles: N/A (initial version)
  Added sections:
    - Core Principles (I–VII)
    - Architecture & Layer Structure
    - Design System Tokens
    - Code Standards & Invariants
    - State Management Patterns
    - API Integration
    - Security
    - Testing & Quality
    - Component Reusability
    - Development Lifecycle
    - Pull Request Checklist
    - Versioning
    - Documentation
    - Governance & Escalation
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md — ✅ aligned (Constitution Check section present)
    - .specify/templates/spec-template.md — ✅ aligned (requirements & success criteria present)
    - .specify/templates/tasks-template.md — ✅ aligned (phase-based, story-driven structure)
  Follow-up TODOs: None
-->

# Card Trading Platform — Constitution

## 1. Purpose & Vision

This constitution is the **single source of truth** for every
architectural, stylistic, and procedural decision in the Card Trading
Platform front-end. It is NOT a tutorial. It is a set of **immutable
rules** that every contributor MUST follow.

**Vision**: Deliver a performant, accessible, and maintainable React
application for trading collectible cards — supporting authentication,
inventory management, card cataloguing, peer-to-peer trades, and
administration — under a monochromatically-themed design system.

**Immutable values**:

1. **Predictability** — Every file, variable, and component follows a
   single convention. No exceptions.
2. **Simplicity** — The minimum code needed to solve the current
   problem. No premature abstractions.
3. **Safety** — Security and data integrity are non-negotiable.
4. **Spec-Driven** — No code is written without a prior specification
   approved through the SSD workflow.

---

## Core Principles

### I. Separation of Concerns (NON-NEGOTIABLE)

Every layer has ONE job. UI components render; hooks orchestrate logic;
services talk to the API; utils transform data. A component MUST NOT
call `axios` directly. A service MUST NOT reference React state.

**Rationale**: Mixing responsibilities creates untestable, unreusable
code.

```jsx
// ✅ CORRECT
function InventoryPage() {
  const { cards, loading } = useCards();
  return <CardList cards={cards} loading={loading} />;
}

// ❌ INCORRECT
function InventoryPage() {
  const [cards, setCards] = useState([]);
  useEffect(() => {
    axios.get('/api/cards').then(r => setCards(r.data));
  }, []);
  return cards.map(c => <div>{c.name}</div>);
}
```

### II. Composition Over Inheritance

React components MUST be composed via props, children, and render
patterns. Class components are forbidden. `extends` is forbidden in
component code.

### III. Unidirectional Data Flow

Data flows **down** via props. Events flow **up** via callbacks.
Side-effects live in hooks, never in render bodies.

### IV. Spec-First Development (NON-NEGOTIABLE)

No feature branch is created without a ratified spec under
`specs/<feature>/spec.md`. Implementation MUST match the spec. Deviations
require a spec amendment before code changes.

### V. Immutable Design Tokens

The design system tokens defined in Section 3 are immutable. Adding a
new token requires a constitution amendment. Overriding tokens with
inline styles is forbidden.

### VI. Testing Discipline

Every component in `common/`, every service, and every custom hook MUST
have tests. Coverage thresholds are defined in Section 9 and enforced in
CI. Untested code MUST NOT be merged.

### VII. Security by Default

Authentication tokens are stored exclusively in `httpOnly` cookies or
in-memory. Passwords are NEVER stored client-side. All user input is
sanitized before rendering. XSS vectors (e.g., `dangerouslySetInnerHTML`)
are forbidden unless explicitly approved in a spec.

---

## 2. Architecture & Layer Structure

### Directory Structure (FIXED)

```
src/
├── components/
│   ├── common/       # Layer 1 — Button, Card, Input, Badge, Modal, Spinner, Toast
│   ├── layout/       # Layer 2 — Header, Sidebar, Footer, MainLayout
│   ├── forms/        # Layer 3 — LoginForm, RegisterForm, CardForm, TradeForm
│   └── features/     # Layer 4 — auth/, cards/, trades/, profile/, admin/
├── pages/            # Layer 5 — LoginPage, DashboardPage, InventoryPage, etc.
├── hooks/            # useApi, useAuth, useForm, useDebounce, usePagination
├── services/         # api.js, authService.js, cardService.js, tradeService.js, etc.
├── context/          # AuthContext, UIContext, NotificationContext
├── styles/           # theme.js, colors.css, typography.css, globals.css
└── utils/            # validators.js, formatters.js, constants.js, errors.js, logger.js
```

### Layer Import Rules (NON-NEGOTIABLE)

| Source Layer | May Import From |
|---|---|
| common (L1) | utils, styles ONLY |
| layout (L2) | common, utils, styles, context |
| forms (L3) | common, layout, hooks, utils, styles, context |
| features (L4) | common, layout, forms, hooks, services, utils, styles, context |
| pages (L5) | ALL layers |
| hooks | services, utils, context |
| services | utils ONLY |
| context | hooks, services, utils |
| utils | NOTHING (zero imports from src/) |

**RULE**: A component in Layer N MUST NOT import from Layer N+1 or
higher. `common/Button` importing from `features/` is a constitution
violation.

### Communication Flow

```
User Action → Page → Feature Component → Hook → Service → API
                                            ↕
                                         Context
```

---

## 3. Design System (Immutable Tokens)

### Color Palette

**Neutrals**:

| Token | Hex | Usage |
|---|---|---|
| neutral-50 | `#FAFAFA` | Page backgrounds |
| neutral-100 | `#F5F5F5` | Card/container backgrounds |
| neutral-200 | `#EEEEEE` | Soft borders, dividers |
| neutral-300 | `#E0E0E0` | Input borders, separators |
| neutral-400 | `#BDBDBD` | Placeholder text, secondary text |
| neutral-500 | `#9E9E9E` | Disabled text |
| neutral-600 | `#757575` | Body text |
| neutral-700 | `#616161` | Strong text, labels |
| neutral-800 | `#424242` | Headings |
| neutral-900 | `#212121` | Primary text, high contrast |

**Accent (Blue-Grey)**:

| Token | Hex | Usage |
|---|---|---|
| accent-light | `#E3F2FD` | Focus backgrounds, selection |
| accent-main | `#1E88E5` | Primary actions, links |
| accent-dark | `#0D47A1` | Hover states, active elements |

**Semantic**:

| Token | Hex | Usage |
|---|---|---|
| success | `#4CAF50` | Success messages, trade accepted |
| warning | `#FF9800` | Pending trades, warnings |
| error | `#F44336` | Errors, trade rejected, validation |
| info | `#2196F3` | Informational notices |

### Typography

- **Font stack**: `'Inter', 'Segoe UI', 'Roboto', sans-serif`
- **Base size**: `16px` (1rem)

| Token | Size | Weight | Usage |
|---|---|---|---|
| heading-1 | 2rem (32px) | 700 | Page titles |
| heading-2 | 1.5rem (24px) | 600 | Section titles |
| heading-3 | 1.25rem (20px) | 600 | Card titles, subsections |
| body | 1rem (16px) | 400 | Body text |
| body-small | 0.875rem (14px) | 400 | Captions, metadata |
| caption | 0.75rem (12px) | 400 | Labels, timestamps |

### Spacing (4px Scale)

| Token | Value |
|---|---|
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-5 | 24px |
| space-6 | 32px |
| space-7 | 48px |
| space-8 | 64px |

Only these values are permitted. Arbitrary pixel values (e.g., `13px`,
`27px`) are forbidden.

### Border Radius

| Token | Value | Usage |
|---|---|---|
| radius-sm | 4px | Badges, small chips |
| radius-md | 8px | Cards, inputs, buttons |
| radius-lg | 12px | Modals, dialogs |
| radius-full | 9999px | Avatars, pills |

### Shadows

| Token | Value | Usage |
|---|---|---|
| shadow-sm | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| shadow-md | `0 4px 6px rgba(0,0,0,0.07)` | Cards, dropdowns |
| shadow-lg | `0 10px 15px rgba(0,0,0,0.10)` | Modals, popovers |

### Breakpoints

| Token | Value | Target |
|---|---|---|
| bp-mobile | 480px | Small phones |
| bp-tablet | 768px | Tablets |
| bp-desktop | 1024px | Desktop |
| bp-wide | 1280px | Wide screens |

Mobile-first approach: base styles target mobile, `min-width` media
queries scale up.

---

## 4. Code Standards (Invariants)

### Naming Conventions (NON-NEGOTIABLE)

| Element | Convention | Example |
|---|---|---|
| Components | PascalCase | `CardList`, `TradeForm` |
| Files (components) | PascalCase.jsx | `CardList.jsx` |
| Hooks | camelCase, `use` prefix | `useAuth`, `useCards` |
| Services | camelCase + `Service` suffix | `cardService.js` |
| Context | PascalCase + `Context` suffix | `AuthContext.jsx` |
| Utils / helpers | camelCase | `formatDate`, `validateEmail` |
| Constants | UPPER_SNAKE_CASE | `MAX_TRADE_ITEMS`, `API_BASE_URL` |
| CSS classes | kebab-case | `card-list`, `trade-form` |
| Event handlers | `handle` + Event | `handleSubmit`, `handleCardClick` |
| Boolean props | `is`/`has`/`can` prefix | `isLoading`, `hasError`, `canTrade` |

### Complexity Limits (NON-NEGOTIABLE)

| Metric | Limit |
|---|---|
| Lines per component file | 200 max |
| Props per component | 5 max |
| JSX nesting depth | 3 levels max |
| `useEffect` per component | 3 max |
| `useState` per component | 5 max |
| Parameters per function | 4 max |
| Cyclomatic complexity per function | 10 max |

If a limit is hit, the component MUST be decomposed.

### Props

- Destructuring is **mandatory** in the function signature.
- PropTypes are **mandatory** for every component.
- Default values MUST be defined via `defaultProps` or default parameter
  values.

```jsx
// ✅ CORRECT
function CardItem({ name, imageUrl, rarity, onClick }) {
  return (/* ... */);
}
CardItem.propTypes = {
  name: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  rarity: PropTypes.oneOf(['common', 'rare', 'epic', 'legendary']).isRequired,
  onClick: PropTypes.func,
};

// ❌ INCORRECT — no destructuring, no PropTypes
function CardItem(props) {
  return <div>{props.name}</div>;
}
```

### Error Handling

- All async operations MUST be wrapped in `try-catch`.
- Errors MUST be logged via `utils/logger.js`.
- User-facing errors MUST use the notification system (NotificationContext),
  never `alert()` or `console.error` alone.

### Comments Policy

- Code MUST be self-documenting. Comments explain **why**, never **what**.
- TODO comments MUST include a ticket/issue reference:
  `// TODO(#42): handle pagination edge case`
- Commented-out code is forbidden.

---

## 5. State Management Patterns

| Need | Solution | Example |
|---|---|---|
| UI toggle, form field | `useState` | Modal open/close, input value |
| Cross-component shared state | Context API | Auth state, UI theme, notifications |
| Server data | Custom hook + service | `useCards()` calling `cardService` |
| Persistent preference | `localStorage` via hook | Dark mode preference, sidebar state |

### Rules

- Props drilling MUST NOT exceed **3 levels**. Beyond that, use Context.
- Context providers MUST be placed at the **lowest common ancestor**,
  not blanket-wrapped at `App`.
- `localStorage` MUST NEVER store tokens, passwords, or sensitive data.
- Every Context MUST expose a custom hook (e.g., `useAuth` for
  `AuthContext`).

```jsx
// ✅ CORRECT — Context with custom hook
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

---

## 6. API Integration

### Service Organization

One file per domain. Each file exports functions, NOT classes.

```
services/
├── api.js            # Axios instance + interceptors
├── authService.js    # login, register, logout, refresh, resetPassword
├── cardService.js    # getCards, getCard, createCard, updateCard, deleteCard
├── tradeService.js   # getTrades, createTrade, acceptTrade, rejectTrade, cancelTrade
├── userService.js    # getProfile, updateProfile, getInventory
└── adminService.js   # getUsers, banUser, getStats, manageTrades
```

### Axios Configuration

```js
// ✅ CORRECT — api.js structure
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = getAccessToken(); // from in-memory store
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401 refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      await refreshAccessToken();
      return api(error.config);
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Response Structure

All service functions MUST return normalized data:

```js
// ✅ CORRECT
export async function getCards(params) {
  const { data } = await api.get('/cards', { params });
  return data;
}
```

Error objects MUST be transformed in the interceptor or service layer,
never in components.

---

## 7. Security (IMMUTABLE)

1. **Passwords**: NEVER stored in `localStorage`, `sessionStorage`,
   cookies, or component state beyond the login form submission.
2. **Access tokens**: Stored in-memory (module-scoped variable).
   NEVER in `localStorage`.
3. **Refresh tokens**: Handled via `httpOnly` cookies set by the
   backend. The front-end NEVER reads or stores refresh tokens directly.
4. **HTTPS**: All API calls MUST use HTTPS in production. Mixed content
   is a constitution violation.
5. **Input sanitization**: All user-supplied strings rendered in JSX
   MUST go through React's default escaping. Use of
   `dangerouslySetInnerHTML` is forbidden.
6. **Validation**: Client-side validation is for UX only. Server-side
   validation is the source of truth. Both MUST exist.
7. **CORS**: The API base URL MUST match the configured allowed origins.
   Wildcard `*` origins are forbidden in production.

---

## 8. Testing & Quality

### Coverage Thresholds (NON-NEGOTIABLE)

| Target | Minimum Coverage |
|---|---|
| `components/common/` | 90% |
| `services/` | 85% |
| `hooks/` | 80% |
| `utils/` | 100% |

### Mandatory Tests

- Every component in `common/` MUST have a test file.
- Every service function MUST have at least one success and one error
  test.
- Every custom hook MUST be tested with `@testing-library/react-hooks`
  or `renderHook`.

### Test Structure

```
src/
├── components/common/Button/__tests__/Button.test.jsx
├── services/__tests__/cardService.test.js
├── hooks/__tests__/useAuth.test.js
└── utils/__tests__/validators.test.js
```

### Test Example

```jsx
// ✅ CORRECT — Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders label text', () => {
    render(<Button label="Trade" />);
    expect(screen.getByText('Trade')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handler = jest.fn();
    render(<Button label="Trade" onClick={handler} />);
    fireEvent.click(screen.getByText('Trade'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('is disabled when isLoading is true', () => {
    render(<Button label="Trade" isLoading />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 9. Component Reusability

### Hierarchy

```
common → layout → forms → features → pages
```

- `common` components are **domain-agnostic**. A `Button` knows nothing
  about cards or trades.
- `layout` components compose `common` into structural patterns.
- `forms` compose `common` + `layout` into form UIs.
- `features` compose all lower layers into domain-specific UI blocks.
- `pages` compose features into routable views.

### Extraction Rule

Extract a component when:
1. The same JSX pattern appears **2+ times** across different files.
2. A single component exceeds the 200-line or 3-nesting-depth limit.
3. A logical grouping has its own state and can be tested independently.

### Coupling Rules

- `common` components MUST accept `className` or `style` props for
  customization — never hard-code domain styles.
- Feature components MUST NOT import from other feature domains
  (e.g., `features/trades/` MUST NOT import from `features/admin/`).
  Shared logic goes in `hooks/` or `utils/`.

---

## 10. Development Lifecycle

### Phase Order

| Phase | What | Gate |
|---|---|---|
| 0 — Foundation | Project setup, tooling, design tokens, `api.js`, auth flow | CI green, tokens match constitution |
| 1 — Common Components | Button, Input, Card, Badge, Modal, Spinner, Toast | 90% test coverage on common/ |
| 2 — Layout | Header, Sidebar, Footer, MainLayout, routing skeleton | All layouts render, responsive |
| 3 — Auth | Login, Register, Reset Password pages + authService | Auth flow works end-to-end |
| 4 — Cards | Inventory CRUD, Card catalogue, cardService | Cards list, create, edit, delete |
| 5 — Trades | Trade creation, listing, accept/reject, tradeService | Full trade lifecycle works |
| 6 — Profile & Admin | User profile, admin panel (if in scope) | Role-based access verified |
| 7 — Polish | Error boundaries, loading skeletons, a11y audit, perf | Lighthouse > 90, a11y pass |

**RULE**: A phase MUST NOT start until the previous phase's gate is
passed.

---

## 11. Pull Request Checklist

### Non-Negotiable (MUST all pass)

- [ ] No lint errors (`npm run lint` passes)
- [ ] All existing tests pass (`npm test` passes)
- [ ] New code has tests meeting coverage thresholds
- [ ] No `console.log` or `debugger` statements
- [ ] No inline styles — all styling uses design tokens
- [ ] No `any` type annotations (if using TypeScript)
- [ ] No `localStorage` usage for auth tokens
- [ ] Component file ≤ 200 lines
- [ ] Props ≤ 5 per component
- [ ] JSX nesting ≤ 3 levels
- [ ] No direct `axios` calls outside `services/`
- [ ] Layer import rules respected
- [ ] PropTypes defined for all components
- [ ] Destructured props in function signature

### Desirable (negotiable with justification)

- [ ] Storybook story added for new common component
- [ ] JSDoc added for exported functions
- [ ] Responsive design verified at all breakpoints
- [ ] Loading and error states handled
- [ ] Accessibility: keyboard navigable, ARIA labels present

---

## 12. Versioning

Semantic Versioning: `MAJOR.MINOR.PATCH`

| Bump | When |
|---|---|
| MAJOR | Breaking UI changes (redesigned pages), removed features, API contract changes that break existing flows |
| MINOR | New feature/page added, new API integration, new common component |
| PATCH | Bug fix, style tweak, copy change, dependency update, performance improvement |

The version is tracked in `package.json`. Every release MUST have a git
tag matching `v{MAJOR}.{MINOR}.{PATCH}`.

---

## 13. Documentation Requirements

### Components (JSDoc above export)

```jsx
/**
 * Reusable card container for displaying collectible card info.
 * @param {string} name - Card display name.
 * @param {string} imageUrl - URL to card artwork.
 * @param {'common'|'rare'|'epic'|'legendary'} rarity - Card rarity tier.
 */
export default function CardItem({ name, imageUrl, rarity }) { /* ... */ }
```

### Services

Every exported function MUST have a JSDoc block with `@param`,
`@returns`, and `@throws`.

### Hooks

Every custom hook MUST have a JSDoc block documenting its return value
shape.

---

## Governance

### Amendment Process

1. Author writes a **Constitution Amendment Proposal (CAP)** describing
   the change, rationale, and impact.
2. CAP is reviewed by at least **one other contributor**.
3. If approved, the constitution is updated, version is bumped, and
   `LAST_AMENDED_DATE` is set.
4. All existing code MUST be migrated to comply within **one sprint** of
   ratification.

### Escalation — Uncovered Cases

If a developer encounters a case not covered by this constitution:

1. **STOP** — do not invent a new pattern ad-hoc.
2. Document the gap in a CAP issue.
3. Propose a solution with code examples.
4. Get approval before implementing.

### Adding New Patterns

New patterns (e.g., a new Context, a new utility category) MUST be
proposed via CAP. The constitution version MUST be bumped (MINOR for new
patterns, PATCH for clarifications).

### Compliance

- All PRs MUST be checked against this constitution.
- CI SHOULD enforce measurable rules (lint, coverage, file length).
- This constitution supersedes all other documentation in case of
  conflict.

**Version**: 1.0.0 | **Ratified**: 2026-04-28 | **Last Amended**: 2026-04-28
