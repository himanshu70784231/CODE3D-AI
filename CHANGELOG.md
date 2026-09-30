# CODE3D-AI — Changelog

All notable changes to the Code3D AI platform are documented in this file.

## [1.2.0] - 2026-09-30

### Fixed
- **Minified React Error #31 Root Cause**:
  - Located trace step emission in `frontend/src/engine/javaSimulator.js` outputting `{ type, target, value }` objects for variable declarations, assignments, and updates.
  - Implemented `formatOperation()` in `frontend/src/utils/safeRender.js` and wrapped all JSX render points in `frontend/src/components/AiPanel.jsx`, `frontend/src/components/Timeline.jsx`, and `frontend/src/components/StepInspector.jsx`.
- **"pi.includes is not a function" Root Cause**:
  - Found unsafe `.includes()` calls across multiple 3D visualizers where minified state properties (`type`, `label`, `comparedIndices`, `swappedIndices`, `pointers`) were `null` or non-arrays.
  - Created `safeIncludes()` and `safeArray()` in `frontend/src/utils/safeRender.js`.
  - Hardened `LinkedListVisualizer3D.jsx`, `HeapVisualizer3D.jsx`, `GraphVisualizer3D.jsx`, `HashTableVisualizer3D.jsx`, `ArrayVisualizer3D.jsx`, `SortingVisualizer3D.jsx`, and `Visualizer.jsx`.
- **Search Query Crashes**:
  - Sanitized `.toLowerCase().includes()` filters in `DsaHub.jsx` and `HistoryPage.jsx` using `String(val || '').toLowerCase()`.

### Changed & Redesigned
- **Information Architecture**:
  - Centered hero 3D WebGL canvas in `Visualizer.jsx` with collapsible code and property sidebars.
  - Redesigned `LoginPage.jsx` with unique 3D developer visual identity and 1-Click Demo Workspace.
  - Redesigned `Dashboard.jsx` with clean metrics, fast action triggers, and recent workspace cards.
- **Theme Architecture**:
  - Complete dark and light theme tokens with global persistence in localStorage.
- **Performance & Code Splitting**:
  - Splitted vendor bundles in `vite.config.js` (`three-vendor`, `monaco-vendor`, `router-vendor`, `lucide-vendor`), reducing main chunk and speeding up initial paint.

### Added
- **Automated Verification Suites**:
  - `scripts/verify_full_e2e.mjs` verifying safe rendering, trace normalization, route protection, and bundle chunks.
- **Documentation**:
  - `AUDIT.md`, `DESIGN-SYSTEM.md`, `QA-REPORT.md`, `CHANGELOG.md`.
