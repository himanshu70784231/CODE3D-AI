# CODE3D-AI — Design System

> Visual language and component guidelines for Code3D AI

---

## Color Palette

### Dark Mode (Default)

| Token | Value | Usage |
|-------|-------|-------|
| `bg-primary` | `#070b14` | App background |
| `bg-panel` | `#0d121f` / `#101c2d` | Panel backgrounds |
| `bg-elevated` | `#142338` | Headers, elevated surfaces |
| `bg-input` | `#0d1726` | Input fields |
| `border-primary` | `#26364a` | Panel borders |
| `border-subtle` | `#1e2c3d` | Table dividers |
| `text-primary` | `#f8fafc` | Primary text |
| `text-secondary` | `#94a3b8` | Secondary/muted text |
| `text-tertiary` | `#64748b` | Disabled/hint text |
| `accent-cyan` | `#38bdf8` | Primary interactive elements |
| `accent-blue` | `#3b82f6` | Buttons, active states |
| `accent-emerald` | `#22c55e` | Success states |
| `accent-rose` | `#ef4444` | Error states |
| `accent-amber` | `#f59e0b` / `#fbbf24` | Warnings, highlights |
| `accent-purple` | `#c084fc` | AI-related features |

### Bright Mode

| Token | Value | Usage |
|-------|-------|-------|
| `bg-primary` | `#f8fafc` | App background |
| `bg-panel` | `#ffffff` | Panel backgrounds |
| `border-primary` | `#e2e8f0` | Panel borders |
| `text-primary` | `#0f172a` | Primary text |
| `text-secondary` | `#64748b` | Secondary text |

---

## Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Display (H1) | Inter | 800 (Extra Bold) | 24-32px |
| Heading (H2) | Inter | 700 (Bold) | 18-20px |
| Label | Inter | 600 (Semibold) | 12px |
| Body | Inter | 400 (Regular) | 13-14px |
| Caption | Inter | 500 (Medium) | 10-11px |
| Mono/Code | Fira Code / JetBrains Mono | 400-600 | 11-12px |
| Badge | Mono | 700 (Bold) | 9-10px |

### Font Loading
```html
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## Spacing System

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Inline gaps |
| `sm` | 8px | Component padding |
| `md` | 12px | Section spacing |
| `lg` | 16px | Panel padding |
| `xl` | 24px | Section margins |
| `2xl` | 32px | Page padding |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Badges, pills |
| `md` | 8px (`rounded-lg`) | Buttons, inputs |
| `lg` | 12px (`rounded-xl`) | Cards, panels |
| `xl` | 16px (`rounded-2xl`) | Modal overlays |
| `full` | 9999px | Avatars, dots |

---

## Component Patterns

### Buttons

**Primary**: `bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold`
- Hover: `from-cyan-400 to-blue-500`
- Active: `scale-[0.99]`

**Secondary**: `bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700`

**Ghost**: `text-slate-400 hover:text-slate-200 hover:bg-slate-800/50`

**Danger**: `bg-rose-500/10 text-rose-400 border border-rose-500/30`

### Inputs

```css
/* Dark */
bg-slate-950/80 border-slate-800 text-white placeholder-slate-500
focus:ring-2 focus:ring-cyan-500

/* Bright */
bg-slate-50 border-slate-300 text-slate-900
focus:ring-2 focus:ring-cyan-500
```

### Cards/Panels

```css
/* Dark */
bg-[#101c2d] border border-[#26364a] rounded-md

/* Bright */
bg-white border-slate-200 rounded-xl shadow-sm
```

### Status Badges

- **Success**: `bg-emerald-950/60 text-emerald-400 border-emerald-500/30`
- **Error**: `bg-rose-950/60 text-rose-400 border-rose-500/30`
- **Warning**: `bg-amber-500/15 text-amber-300 border-amber-500/40`
- **Info**: `bg-cyan-950/70 text-cyan-300 border-cyan-800`

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640-1023px | Two columns |
| Desktop | 1024-1279px | Three-column workspace |
| Large | ≥ 1280px | Full IDE layout |

### Mobile Adaptations
- Bottom navigation bar (h-14) replaces top nav
- Sidebar panels become drawers
- 3D canvas remains primary focus
- Forms remain thumb-friendly

---

## Animation Guidelines

- **Duration**: 150-200ms for interactions, 300ms for panels
- **Easing**: `transition-all` with default Tailwind easing
- **Hover**: Scale 1.02 on interactive cards
- **Active**: Scale 0.98-0.99 on buttons
- **Loading**: `animate-pulse` for skeletons, `animate-spin` for loaders
- **Respect**: `prefers-reduced-motion` media query

---

## Iconography

Primary icon library: **Lucide React**
- Size: 11-16px inline, 20-28px decorative
- Stroke width: Default (2px)
- Color: Matches text color or accent

---

## 3D Visualization Palette

| Element | Color |
|---------|-------|
| Array cells | `#38bdf8` (cyan) |
| Active index | `#f59e0b` (amber) |
| Compared indices | `#fbbf24` (yellow) |
| Swapped indices | `#22c55e` (green) |
| Sorted elements | `#10b981` (emerald) |
| Grid floor | `#1e293b` |
| Ambient light | `#38bdf8` at 0.3 intensity |
