# CODE3D-AI — Master Changelog

> All significant architectural, security, performance, and UX/UI modifications.

---

## Phase 2 — React Error #31 Fix

### Root Cause Analysis
**React Error #31** ("Objects are not valid as a React child") was triggered when execution trace data structures or error objects were rendered directly in JSX interpolations. Specifically:
- `correctOutput` could be an arbitrary object if `lastStep.returnValue` returned an object or array.
- `condition.expression`, `condition.evaluation`, `condition.branch` from AST trees were passed directly to JSX.
- `explanation` and `aiHint` trace step metadata could contain objects.
- `output[]` lines from simulated runtime execution could contain objects.
- `cumulativeOutput[]` accumulated values without string validation.
- `executionError` was rendered as `{executionError}` in `Visualizer.jsx`, which failed whenever an Error instance was passed.

### Fix Implementation
- Created `src/utils/safeRender.js` providing:
  - `safeString(val, fallback)`: Guaranteed safe string conversion with JSON stringify fallback.
  - `safeDisplay(val, fallback)`: Safe display for JSX children (preserves primitives, formats objects).
  - `safeErrorMessage(err, defaultMsg)`: Safely extracts `.message` or formats error objects.
  - `validVector(vec)`, `validScale(scale)`, `validColor(color)`: 3D defensive defaults.
- Updated `src/hooks/useExecution.js`: `finalCorrectOutput` now strictly returns `string` or `null`; `cumulativeOutput` items are mapped to strings.
- Protected JSX renders across: `StatePanel.jsx`, `StepInspector.jsx`, `OutputConsole.jsx`, `ConditionPanel.jsx`, `OutputHologram3D.jsx`, and `Visualizer.jsx`.

---

## Phase 4 & 15 — Authentication-First Routing Architecture

### Redirection & Protection Architecture
- Enforced strict auth-first routing in `App.jsx` and `ProtectedRoute.jsx`:
  - **Logged-out users**: Default landing experience is `/login`. Attempting to access protected routes (`/dashboard`, `/visualizer`, `/workspace`, `/projects`, `/settings`, `/saved`, `/history`, `/profile`, `/dsa`, `/ai`, `/quiz`) triggers a clean redirect to `/login` with `state: { from: location }` preserved.
  - **Logged-in users**: Visiting `/login` or `/register` redirects immediately to `/dashboard`.
  - **Post-login redirect**: Redirects to the originally requested route (`location.state?.from?.pathname`) or `/dashboard`.
  - **Logout**: Clears cached user state, auth token, and redirects directly to `/login`.
  - **Public routes**: `/login`, `/register`, `/signup` are rendered full-screen without workspace top/bottom navbars.

---

## Phase 5 — Login Page Redesign

### Brand Identity & UX
- Created an elevated developer-tool login experience in `src/pages/LoginPage.jsx`:
  - Deep near-black background (`#070b14`) with subtle isometric SVG grid pattern.
  - Floating 3D isometric cube wireframe illustration.
  - Prominent wordmark: **CODE3D AI** with gradient glowing accents.
  - Hero headline: **"Turn Code Into 3D Intelligence."**
  - Supporting text: **"Visualize, understand and explore your code in an interactive 3D workspace."**
  - Form fields: Email/Username, Password with toggleable eye visibility, "Remember session" checkbox, "Forgot password" modal dialog.
  - Primary CTA: **"Continue to Code3D"** with active spinner and keyboard Enter support.
  - Quick Access: **"Launch Instant Demo Workspace (1-Click)"** allowing reviewers and students to explore with zero friction.
  - Fully responsive across mobile (360px–430px) with touch-friendly controls.

---

## Phase 7 — Dashboard Redesign

### Structure & Feature Additions
- Completely redesigned `src/pages/Dashboard.jsx`:
  - **Hero Section**: "Build. Visualize. Understand." with workspace status indicator.
  - **Quick Action Bar**: `+ New Visualization`, `Import Project`, and `Open Workspace`.
  - **Ask Code3D AI Section**: Interactive prompt chips ("Explain this function", "Visualize this algorithm", "Find dependencies", "Show execution flow") and direct input bar.
  - **Recent Projects Grid**: Project cards showing language, last modified time, status ("3D Verified", "AST Compiled"), and quick "Open in 3D" action.
  - **Quick Start SDE Templates**: Curated algorithm cards with time complexity badges and one-click launch.
  - **Runtime Diagnostics**: WebGL 2.0 GPU status, AST Interpreter health, and PostgreSQL connection.

---

## Phase 8 & 9 — 3D Visualizer UX & WebGL Stability

- Center 3D canvas is the primary hero feature with collapsible sidebars and theater mode.
- Added empty-state overlay inside `ScenePanel.jsx` when no program is loaded:
  *"Your 3D workspace is waiting. Paste code or select an algorithm template to generate your interactive 3D visualization."*
- WebGL context loss handling and automatic canvas recovery.
- Dynamic bounding camera auto-fits to algorithm data structure scale.
- Three.js Text component guarded with `safeString`.

---

## Phase 12 — Accessibility Enhancements

- Added `@media (prefers-reduced-motion: reduce)` in `src/index.css` to respect users' vestibular motion settings.
- Added `focus-visible` styling (`outline: 2px solid #38bdf8`) for visible keyboard navigation.
- Accessible ARIA labels and button semantics across auth forms and controls.

---

## Phase 13 & 23 — Performance & Code Splitting

- Configured Vite `rollupOptions.output.manualChunks` in `vite.config.js`:
  - `three-vendor`: Three.js, `@react-three/fiber`, `@react-three/drei` (~947 kB)
  - `monaco-vendor`: `@monaco-editor/react` (~14.9 kB)
  - `router-vendor`: `react-router-dom` (~179 kB)
  - `lucide-vendor`: `lucide-react` (~33.6 kB)
- Eliminated the Vite 2.2MB single-chunk warning.
- Login and landing screens load instantaneously without loading 3D or Monaco libraries.

---

## Phase 24 — Vercel Production Deployment

- Root `vercel.json` verified:
  - Framework: `vite`
  - Output directory: `frontend/dist`
  - Rewrites: Asset routes preserved and all client-side routes redirected to `/index.html`.
