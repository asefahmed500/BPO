# Northbridge BPO — Design System & UI/UX Audit

> Single source of truth for the project's visual language, component patterns, and a findings-led audit of where the current implementation diverges.
>
> **Status:** This document is part **specification** (the intended system) and part **audit** (the gaps between intent and reality). Each audit finding is severity-tagged and lists the files it touches.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Foundations / Design Tokens](#2-foundations--design-tokens)
3. [Typography](#3-typography)
4. [Spacing, Layout & Grid](#4-spacing-layout--grid)
5. [Color Usage Map](#5-color-usage-map)
6. [Component Catalog](#6-component-catalog)
7. [Component Patterns & Recipes](#7-component-patterns--recipes)
8. [Motion & Animation](#8-motion--animation)
9. [Iconography](#9-iconography)
10. [State Patterns (Loading, Empty, Error, Status)](#10-state-patterns-loading-empty-error-status)
11. [Application Shell](#11-application-shell)
12. [Responsiveness & Breakpoints](#12-responsiveness--breakpoints)
13. [Accessibility](#13-accessibility)
14. [Audit Findings & Remediation](#14-audit-findings--remediation)
15. [Recommended Adoption Rules](#15-recommended-adoption-rules)
16. [Appendix: File Inventory](#16-appendix-file-inventory)

---

## 1. Executive Summary

The project is a **Next.js 16 + Tailwind v4** application (Northbridge BPO marketing site + authenticated product app). It uses a calm, editorial, near-monochrome aesthetic — warm stone tones, an EB Garamond display face paired with Inter body text, generous whitespace, and soft motion.

### The core problem: two parallel styling systems coexist

The single most important finding from this audit is that the codebase ships **two inconsistent implementations of the same intended design language**:

| Surface | Styling method | Icons | Letter spacing |
|---|---|---|---|
| **App shell + product + auth** (`app/(app)/*`, `sign-in`, `sign-up`, `app-sidebar`, `app-topbar`, `widgets`, `collapsible-card`) | **Semantic tokens** (`text-ink`, `bg-canvas`, `border-hairline`, `bg-primary`) | `lucide-react` | Tailwind `tracking-[...]` |
| **Marketing site** (`hero`, `navbar`, `footer`, `services-section`, `stats-section`, `cta-section`, `testimonials`, `why-northbridge`, `case-study`, `trust-bar`, `dashboard-section`, `app/*` marketing pages) | **Raw hex values** (`text-[#0c0a09]`, `bg-[#292524]`, `text-[#777169]`) | Hand-written inline `<svg>` | Inline `style={{ letterSpacing }}` |

Both produce the same pixels — but they cannot share a theme change, they drift independently, and several tokens defined in `@theme inline` are effectively **dead** (defined but never consumed). See [§14](#14-audit-findings--remediation) for the prioritized fix list.

---

## 2. Foundations / Design Tokens

Tokens are defined in **`app/globals.css`** via Tailwind v4's `@theme inline` block. Tailwind auto-generates utilities from each token (e.g. `--color-ink` → `bg-ink`, `text-ink`, `border-ink`).

### 2.1 Color tokens

| Token | Value | Generated utility | Purpose |
|---|---|---|---|
| `--color-canvas` | `#f5f5f5` | `bg-canvas` | Page background |
| `--color-canvas-soft` | `#fafafa` | `bg-canvas-soft` | Subtle section backgrounds |
| `--color-canvas-deep` | `#0c0a09` | `bg-canvas-deep` | (unused — see audit) |
| `--color-surface-card` | `#ffffff` | `bg-surface-card` | Card fill (currently `bg-white` is used instead) |
| `--color-surface-strong` | `#f0efed` | `bg-surface-strong` | Stronger neutral fill (avatars, icon chips) |
| `--color-surface-dark` | `#0c0a09` | `bg-surface-dark` | Footer/dark bands |
| `--color-surface-dark-elevated` | `#1c1917` | `bg-surface-dark-elevated` | Elevated dark surface |
| `--color-hairline` | `#e7e5e4` | `border-hairline` | Default 1px borders |
| `--color-hairline-soft` | `#f0efed` | `border-hairline-soft` | Faint divider lines |
| `--color-hairline-strong` | `#d6d3d1` | `border-hairline-strong` | Emphasized borders, focus rings |
| `--color-ink` | `#0c0a09` | `text-ink` / `bg-ink` | Primary text & primary buttons |
| `--color-body` | `#4e4e4e` | `text-body` | Body copy |
| `--color-body-strong` | `#292524` | `text-body-strong` | Emphasized body / labels |
| `--color-muted` | `#777169` | `text-muted` | Secondary text, captions |
| `--color-muted-soft` | `#a8a29e` | `text-muted-soft` | Placeholders, disabled |
| `--color-on-primary` | `#ffffff` | `text-on-primary` | Text on primary buttons |
| `--color-on-dark` | `#ffffff` | `text-on-dark` | Text on dark surfaces |
| `--color-on-dark-soft` | `#a8a29e` | `text-on-dark-soft` | Secondary text on dark |
| `--color-primary` | `#292524` | `bg-primary` | Primary action fill |
| `--color-primary-active` | `#0c0a09` | `bg-primary-active` | Pressed/active primary |
| `--color-gradient-mint` | `#a7e5d3` | `bg-[var(--color-gradient-mint)]` | Accent (used as raw hex `#a7e5d3`) |
| `--color-gradient-peach` | `#f4c5a8` | — | Accent |
| `--color-gradient-lavender` | `#c8b8e0` | — | Accent |
| `--color-gradient-sky` | `#a8c8e8` | — | Accent |
| `--color-gradient-rose` | `#e8b8c4` | — | Accent |
| `--color-semantic-success` | `#16a34a` | (unused as token) | Success — see audit |
| `--color-semantic-error` | `#dc2626` | (unused as token) | Error — see audit |

### 2.2 Font tokens

| Token | Stack |
|---|---|
| `--font-sans` | `"Inter", ui-sans-serif, system-ui, sans-serif` |
| `--font-display` | `"EB Garamond", "Times New Roman", serif` |

Both fonts are loaded via `next/font/google` in `app/layout.tsx` (`Inter`, `EB_Garamond`) with `display: swap` and CSS variables `--font-inter` / `--font-garamond`. The `@theme inline` maps them into `--font-sans` / `--font-display`, which generate the `font-sans` (default body) and `font-display` utilities.

### 2.3 Tone system (semantic accents)

A reusable accent palette is used for categorical data (metric cards, activity dots, chart segments). Defined locally in `components/dashboard/widgets.tsx`:

```ts
const tones = {
  mint:     { bg: "bg-[#eaf7f2]", fg: "text-[#1f7a66]" },
  lavender: { bg: "bg-[#f1ecf7]", fg: "text-[#5e4b8b]" },
  peach:    { bg: "bg-[#fbede3]", fg: "text-[#9c5a2f]" },
  sky:      { bg: "bg-[#eaf1f8]", fg: "text-[#2f5a86]" },
  ink:      { bg: "bg-[#f0efed]", fg: "text-[#292524]" },
};
```

> ⚠️ These accent shades (`#1f7a66`, `#5e4b8b`, `#9c5a2f`, `#2f5a86`, `#3fae7f`, `#a7e5d3`, `#c8b8e0`, `#f4c5a8`, `#a8c8e8`) are **not** part of the token system — they appear only as raw hex literals scattered across `hero.tsx`, `widgets.tsx`, `stats-section.tsx`, etc. They should be promoted to tokens. (See finding F-04.)

---

## 3. Typography

### 3.1 Type roles

| Role | Font | Weight | Class pattern | Used for |
|---|---|---|---|---|
| Display / Headline | EB Garamond | 300 (light) | `font-display font-light` | Page titles (`h1`–`h6` via `@layer base`), hero headline, large metric numbers |
| Display / Title | EB Garamond | 400–500 | `font-display font-medium` | Panel titles, card titles |
| Body | Inter | 400 (default) | `font-sans` (implicit) | Paragraphs, descriptions |
| Label | Inter | 600 | `font-semibold` | Eyebrows, metric labels (`uppercase`) |
| Action | Inter | 500 | `font-medium` | Buttons, nav links |

### 3.2 Type scale (observed, in px)

The scale is **not tokenized** — sizes are written as arbitrary values. Observed scale:

| Use | Size | Line height | Tracking |
|---|---|---|---|
| Hero headline (xl) | `36→68px` responsive | `1.06` | `-1px → -2px` |
| Section heading | `32–36px` | `1.17` | `-0.36px` |
| Card title | `20px` | `1.35` | `0.16px` |
| Page header title | `26px` | — | `-0.4px` |
| Metric value | `28–32px` | `1.13` / `none` | `-0.32px` / `-0.4px` |
| Body | `15–19px` | `1.5–1.6` | `0.15–0.18px` |
| Nav / button | `14–15px` | `1.4` / `none` | — |
| Caption / label | `11–13px` | `1.5` | `0.4px` (uppercase) / `0.96px` (eyebrow) |

> ⚠️ Letter-spacing values are applied via inline `style={{ letterSpacing: "0.15px" }}` on the marketing site (40+ occurrences) but as Tailwind `tracking-[...]` utilities on the app side. (See finding F-03.)

### 3.3 Global base styles (`@layer base`)

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 300;
  color: var(--color-ink);
  text-wrap: balance;
}
p { text-wrap: pretty; }
```

Implication: any `<h1>`–`<h6>` automatically inherits `font-display` + `font-light` + `text-ink`. Most components then **re-declare** these explicitly on spans, which is redundant but harmless.

---

## 4. Spacing, Layout & Grid

### 4.1 Spacing

The project uses Tailwind's default 4px spacing scale. There is no custom spacing token. Common values:

- **Card padding:** `p-5` (app widgets) / `p-6` (marketing cards) — *inconsistent*
- **Section padding:** `px-5 md:px-20 py-16 md:py-24` (marketing)
- **App main padding:** `p-8`
- **Gaps:** `gap-3`, `gap-4`, `gap-5`, `gap-6` (cards); `gap-1`–`gap-2` (tight clusters)

### 4.2 Grid

- **Marketing sections:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5` (feature card grids); `grid grid-cols-2 md:grid-cols-5` (stats)
- **App dashboard:** `grid grid-cols-2 lg:grid-cols-3 gap-4` (metric grid); `grid grid-cols-1 lg:grid-cols-3 gap-6` (panels)
- CSS Grid (`grid`, `grid-cols-*`) is used for these simple card grids. No complex grid systems.

### 4.3 Containers & width

- Marketing content max-width: `max-w-[1200px]` (navbar), `max-w-[1000px]` (hero copy), `max-w-[620px]` / `max-w-[540px]` (section intros)
- Auth form: `max-w-sm`
- No global `<Container>` wrapper component — max-widths are repeated inline.

### 4.4 Radii

| Radius | Class | Used for |
|---|---|---|
| Full / pill | `rounded-full` | Primary buttons (marketing), avatar chips, icon-only buttons |
| Large | `rounded-2xl` | Cards, panels, mobile nav sheet, metric cards |
| Medium | `rounded-xl` | Inputs (auth), icon chips, quick-action rows, secondary buttons (auth) |
| Small | `rounded-lg` | Mobile menu toggle button |
| Extra small | `rounded-sm` | Chart bars, sparkline bars |

> ⚠️ Button radius is inconsistent: marketing CTAs use `rounded-full` (pill), auth submit uses `rounded-xl` (rect). (See finding F-07.)

---

## 5. Color Usage Map

A quick reference of "which color for what," distilled from the codebase.

| Need | Token (preferred) | Raw fallback in use |
|---|---|---|
| Page background | `bg-canvas` | `bg-[#f5f5f5]` |
| Section tint | `bg-canvas-soft` | `bg-[#fafafa]` |
| Card surface | `bg-white` (or `bg-surface-card`) | `bg-white` |
| Strong neutral chip | `bg-surface-strong` | `bg-[#f0efed]` |
| Dark band (footer) | `bg-surface-dark-elevated` | `bg-[#1c1917]` |
| Primary text | `text-ink` | `text-[#0c0a09]` |
| Body text | `text-body` | `text-[#4e4e4e]` |
| Emphasized label | `text-body-strong` | `text-[#292524]` |
| Muted / caption | `text-muted` | `text-[#777169]` |
| Placeholder / disabled | `text-muted-soft` | `text-[#a8a29e]` / `text-[#57534e]` |
| Primary button | `bg-ink` / `bg-primary` | `bg-[#292524]` |
| Button text | `text-on-primary` | `text-white` |
| Border (default) | `border-hairline` | `border-[#e7e5e4]` |
| Border (strong) | `border-hairline-strong` | `border-[#d6d3d1]` |
| Footer divider | — | `border-[#292524]` / `border-[#57534e]` |
| Success / live indicator | — (no token used) | `#3fae7f`, `#1f7a66` |
| Error | — (`semantic-error` unused) | `bg-red-50 border-red-200 text-red-700` |

---

## 6. Component Catalog

### 6.1 Shared / reusable components

| Component | File | Props | Notes |
|---|---|---|---|
| `PageHeader` | `components/dashboard/widgets.tsx` | `title`, `subtitle?`, `action?{label,href}` | App page title row + optional pill CTA |
| `MetricCard` | `widgets.tsx` | `icon`, `label`, `value`, `sub?`, `tone?`, `loading?` | Stagger-animated KPI card |
| `MetricGrid` | `widgets.tsx` | `children` | `grid-cols-2 lg:grid-cols-3`, stagger container |
| `Panel` | `widgets.tsx` | `title`, `action?`, `children`, `className?` | Standard white card with title + link |
| `BarChart` | `widgets.tsx` | `data[]`, `totalLabel?` | Pure-CSS vertical bar chart, motion scaleY |
| `ActivityList` | `widgets.tsx` | `items[]`, `emptyText?` | Timeline list with tone dot |
| `QuickActionRow` | `widgets.tsx` | `href`, `label` | Full-width link row with arrow |
| `CollapsibleCard` | `components/collapsible-card.tsx` | `title`, `badge?`, `defaultOpen?`, `children` | Disclosure card (no animation on expand) |
| `AppSidebar` | `components/app-sidebar.tsx` | `role`, `userName` | Collapsible nav, role-aware items |
| `AppTopbar` | `components/app-topbar.tsx` | `title` | Sticky blurred header + `NotificationBell` |
| `NotificationBell` | `components/notification-bell.tsx` | — | Header unread indicator |
| `SiteChrome` | `components/site-chrome.tsx` | `children` | Hides Navbar/Footer/Chatbot on app routes |
| `ScrollReveal` | `components/scroll-reveal.tsx` | `children`, `className?`, `delay?` | Single fade-up on scroll |
| `StaggerGroup` | `scroll-reveal.tsx` | `children`, `className?` | Stagger container (must wrap `StaggerItem`) |
| `StaggerItem` | `scroll-reveal.tsx` | `children`, `className?` | Stagger child |

### 6.2 Marketing sections (not parameterized — fixed content)

`Hero`, `Navbar`, `Footer`, `TrustBar`, `ServicesSection`, `StatsSection`, `DashboardSection`, `WhyNorthbridge`, `Testimonials`, `CaseStudy`, `CtaSection`, `Chatbot`.

### 6.3 Product feature components

`MeetingCalendar` (Google-Calendar-style), `LiveChatInbox`, `UserChat`, `ScheduleMeetingForm`.

### 6.4 Missing shared primitives

There is **no** shared component for: **Button**, **Input**, **Badge**, **StatusBadge**, **Modal/Dialog**, **Table**, **Avatar**, **EmptyState**, **Spinner**. These are re-implemented inline in every page. (See finding F-09.)

---

## 7. Component Patterns & Recipes

### 7.1 The canonical card

```tsx
<div className="flex flex-col bg-white border border-hairline rounded-2xl p-5">
  {/* header */}
  {/* body */}
</div>
```

Variants: marketing cards add `hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]`; floating hero cards use `bg-white/70 backdrop-blur-md border border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.06)]`.

### 7.2 The canonical button

Three informal button styles exist with **no shared component**:

| Variant | Pattern | Where |
|---|---|---|
| Primary (pill) | `bg-[#292524] rounded-full px-6 text-white text-[15px] font-medium` | Marketing CTAs |
| Primary (rect) | `bg-primary text-on-primary rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-primary-active` | Auth |
| Primary (pill, token) | `bg-ink text-on-primary rounded-full px-5 text-sm hover:opacity-90` | `PageHeader` action |
| Secondary / outline | `bg-white border border-hairline-strong rounded-full text-ink` | Marketing secondary |
| Quiet link | `text-muted hover:text-ink` | Nav links, "View all" |

### 7.3 The canonical input

```tsx
<input
  className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl text-sm text-ink
             placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
/>
```

Used in `sign-in` / `sign-up` only — product forms (calendar, meeting, chat) define their own input styles.

### 7.4 Eyebrow / section label

```tsx
<span className="text-muted text-[12px] font-semibold tracking-[0.96px] uppercase">By the numbers</span>
```

Repeated ~6 times across marketing components.

### 7.5 Status dots & live indicators

```tsx
<span className="relative flex size-2">
  <span className="absolute inline-flex size-full rounded-full bg-[#3fae7f] opacity-75 animate-ping" />
  <span className="relative inline-flex size-2 rounded-full bg-[#3fae7f]" />
</span>
```

Hand-copied across `hero.tsx` (twice), `notification-bell`, chat components.

---

## 8. Motion & Animation

Library: **`motion`** (the framer-motion successor), imported from `motion/react`. The entire app is wrapped in `<MotionConfig reducedMotion="user">` so OS-level reduced-motion is honored.

### 8.1 Shared presets — `lib/motion-presets.ts`

| Export | Type | Description |
|---|---|---|
| `EASE_OUT` | `[0.16, 1, 0.3, 1]` | The signature easing (used everywhere) |
| `fadeUp` | `Variants` | `opacity 0→1`, `y 24→0`, 0.6s |
| `fadeIn` | `Variants` | `opacity 0→1`, 0.5s |
| `staggerContainer` | `Variants` | `staggerChildren 0.08`, `delayChildren 0.04` |
| `staggerItem` | `Variants` | `opacity 0→1`, `y 16→0`, 0.5s |
| `viewportOnce` | `{ once: true, margin: "-80px" }` | Standard `whileInView` viewport config |

**Rule:** Reuse these presets. Do not hand-roll variants. `hero.tsx` violates this by defining its own `container`/`item` with slightly different durations. (See finding F-08.)

### 8.2 CSS keyframe animations — `globals.css`

| Class | Effect |
|---|---|
| `animate-fade-in-up` | 400ms fade+rise (mobile nav) |
| `animate-fade-in-scale` | 350ms fade+scale |
| `animate-mesh-drift` | 20s drifting gradient mesh background |
| `animate-orb-drift` | 12s floating orb |
| `animate-reveal` (+ `.revealed`) | IntersectionObserver-driven reveal (CSS fallback) |
| `stagger-1` … `stagger-10` | 0–360ms animation-delay helpers (40ms step) |

`@media (prefers-reduced-motion: reduce)` disables all of the above.

> Note: `animate-reveal`/`.revealed` and the `.stagger-N` delay classes are defined but **no usage was found** in the codebase — they may be legacy. (See finding F-10.)

### 8.3 Micro-interactions

- Card hover lift: `whileHover={{ y: -3 }}` / `y: -4`
- Button hover: `whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}`
- Active scale (CSS): `active:scale-[0.97]`
- Icon follow on hover: `group-hover:translate-x-[2px]`, `group-hover:scale-110`
- Count-up numbers: `animate(from, to, { onUpdate })` from motion (see `stats-section.tsx`)

---

## 9. Iconography

### 9.1 Two incompatible systems

- **`lucide-react`** (correct, preferred) — used by the app shell: `widgets.tsx`, `app-sidebar.tsx`, `meeting-calendar.tsx`, `schedule-meeting-form.tsx`, and dashboard/admin pages.
- **Hand-written inline `<svg>`** — used by the entire marketing site: `navbar`, `footer`, `hero`, `services-section`, `testimonials`, `trust-bar`, `why-northbridge`, `case-study`, `chatbot`, `dashboard-section`. Several of these inline SVGs are **lucide paths copied by hand** (e.g. the home, bell, settings gear, chevron-down in `app-sidebar.tsx` are stored as path *strings* and rendered through a custom `SvgIcon` wrapper).

> ⚠️ This means icon updates from lucide won't propagate, stroke widths can drift (`1.5` vs `2` vs `2.5`), and the marketing site pays for ~20 duplicate inline SVG definitions. (See finding F-05.)

### 9.2 Standard icon sizing

- Inline body icons: `w-4 h-4` (16px), `w-5 h-5` (20px)
- Feature card icons: 22×22 inside a `size-11` circle
- Metric card icons: `w-4 h-4` inside a `size-9` chip
- Stroke width: `1.5` (most), `1.75` (metric icons), `2`–`2.5` (chart/arrow accents)

---

## 10. State Patterns (Loading, Empty, Error, Status)

### 10.1 Loading

- **Full-page:** spinner — `w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin` + "Loading..." (`app/(app)/layout.tsx`)
- **Inline metric:** the string `"…"` when `loading` is true (`MetricCard`)
- **Inline text:** "Loading…" / "Loading…" in panels

### 10.2 Empty states

- `ActivityList`: `<p className="text-sm text-muted">{emptyText}</p>` (defaults "Nothing yet")
- Dashboard panels: `text-sm text-muted py-8 text-center` ("No projects yet")
- **There is no shared `<EmptyState>` component.** Each page rolls its own.

### 10.3 Error

Only one error surface exists (`sign-in`):

```tsx
<div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
```

This uses raw Tailwind `red-*` names, **not** the `--color-semantic-error` token. (See finding F-02.) No form-field-level error styling exists anywhere.

### 10.4 Status badges

No `StatusBadge` component exists. Project status is rendered as plain text (e.g. `· {item.status}` in activity lists, lowercased). Product pages render status ad hoc.

---

## 11. Application Shell

```
┌─────────────────────────────────────────────┐
│ SiteChrome decides: marketing chrome vs app │
└─────────────────────────────────────────────┘
        │
        ├── Marketing route → <Navbar/> <main/> <Footer/> <Chatbot/>
        │
        └── App route (/dashboard, /admin, /support, /sign-in, /sign-up)
            │
            AppLayout (auth guard + role gate)
            ├── <AppSidebar role userName/>     ← 264px / collapses to 64px
            └── <div flex-1>
                  ├── <AppTopbar title/>         ← sticky, blur, NotificationBell
                  └── <main p-8>                 ← page content
```

- Auth/role gating happens client-side in `app/(app)/layout.tsx` (redirects to `/sign-in` if no session; `/admin` requires `admin`, `/support` requires `support` or `admin`).
- The sidebar nav set is selected by `role` (`user` / `admin` / `support`).
- Page titles are looked up from a `pageTitles` map keyed by pathname prefix.

---

## 12. Responsiveness & Breakpoints

Tailwind v4 defaults (no custom breakpoints defined):

| Breakpoint | Width | Behavior |
|---|---|---|
| base | `<640px` | Single column, mobile nav, floating hero cards hidden |
| `sm` | `≥640px` | 2-col grids may begin; show sign-in / "Get a Quote" |
| `md` | `≥768px` | Marketing grids go 2-col; larger type scale kicks in |
| `lg` | `≥1024px` | Desktop nav visible; grids go 3-col; hero floating cards visible |

Patterns:
- Hero responsive type: `text-[36px] sm:text-[46px] md:text-[58px] lg:text-[68px]`
- Section horizontal padding: `px-5 md:px-20`
- Sidebar collapses via a button (not via breakpoint) — manual toggle, state in `AppSidebar`.

> No tablet-specific layout tuning; the app shell sidebar does **not** auto-collapse on narrow viewports — only manually. (Possible UX gap on tablet/mobile product views.)

---

## 13. Accessibility

**Strengths:**
- `prefers-reduced-motion` is respected globally (MotionConfig + CSS media query).
- `text-wrap: balance` on headings, `pretty` on paragraphs.
- Icon-only buttons generally have `aria-label` / `title` (e.g. sidebar collapse, menu toggle).
- Inputs in auth forms have associated `<label htmlFor>`.

**Gaps (see findings F-11, F-12):**
- No visible `:focus-visible` ring on interactive elements — focus styling relies on `focus:border-ink` (border-only, low contrast). Keyboard users get weak focus indication.
- Status information is conveyed by color/dot alone in several places (live indicator, activity tone dots) with no text alternative in proximity.
- `dangerouslySetInnerHTML` for entities like `&amp;` introduces an unnecessary injection surface (see F-06).
- Decorative inline SVGs in marketing lack `aria-hidden="true"`.

---

## 14. Audit Findings & Remediation

Findings are severity-ranked: **🔴 Critical** (correctness/maintainability blocker), **🟠 High** (drift/consistency), **🟡 Medium** (polish), **⚪ Low** (cleanup).

### 🔴 F-01 — Two parallel color systems (tokens vs raw hex)

**Problem.** The marketing site uses raw hex (`text-[#0c0a09]`, `bg-[#292524]`, `text-[#777169]`, `border-[#e7e5e4]`, …) while the app shell uses semantic tokens (`text-ink`, `bg-primary`, `text-muted`, `border-hairline`). A theme change (e.g. dark mode, rebrand) requires editing ~29 files on the marketing side and cannot be done centrally.

**Scope (raw-hex consumers, 29 files):**
`components/{hero,navbar,footer,stats-section,services-section,cta-section,testimonials,why-northbridge,case-study,trust-bar,dashboard-section,chatbot}.tsx`, `app/{about,careers,contact,industries,resources,services}/page.tsx`, plus stragglers in `app/(app)/admin/*`, `app/(app)/dashboard/{notifications,projects}/*`.

**Fix.** Replace raw hex with the corresponding semantic token (see [§5 map](#5-color-usage-map)). Mechanical, low-risk. Example:
`text-[#0c0a09]` → `text-ink`; `text-[#777169]` → `text-muted`; `border-[#e7e5e4]` → `border-hairline`; `bg-[#292524]` → `bg-primary`.

### 🔴 F-02 — Semantic success/error tokens are dead

**Problem.** `--color-semantic-success` (`#16a34a`) and `--color-semantic-error` (`#dc2626`) are defined but **never consumed**. The one error UI (`sign-in`) hardcodes `bg-red-50 border-red-200 text-red-700`. Live/success indicators hardcode `#3fae7f` / `#1f7a66`.

**Fix.** Either (a) remove the unused tokens, or (b) adopt them: add derived utilities (`--color-success-soft`, `--color-error-soft` etc.) and replace raw `red-*` / `#3fae7f` usage. Recommend (b) and also add the success-green family that's clearly in use (`#3fae7f`, `#1f7a66`).

### 🟠 F-03 — Inline `style={{ letterSpacing }}` instead of Tailwind tracking

**Problem.** Marketing components apply letter spacing via inline style (~40 occurrences across `hero`, `footer`, `services-section`, `stats-section`, `why-northbridge`, marketing pages). This bypasses Tailwind, can't be overridden, and is inconsistent with the app side which uses `tracking-[...]`.

**Fix.** Replace `style={{ letterSpacing: "0.15px" }}` with `tracking-[0.15px]` (or define named tracking tokens for the ~3 values in use: `0.15px`, `0.16px`, `0.96px`).

### 🟠 F-04 — Accent palette not tokenized

**Problem.** The tone system (`mint`/`lavender`/`peach`/`sky`/`ink`) and the success greens (`#3fae7f`, `#1f7a66`) live only as raw hex literals in `widgets.tsx`, `hero.tsx`, `stats-section.tsx`. The `--color-gradient-*` tokens exist but are bypassed.

**Fix.** Add token pairs (e.g. `--color-mint`, `--color-mint-fg`, `--color-mint-soft`) and update the `tones` map + hero accents to reference them.

### 🟠 F-05 — Dual icon systems (lucide-react vs hand-written SVG)

**Problem.** App uses `lucide-react`; marketing hand-writes inline SVGs (often copying lucide paths). Stroke width drifts (`1.5`/`2`/`2.5`); lucide updates don't propagate; ~20 duplicate SVG definitions ship.

**Fix.** Replace marketing inline SVGs with `lucide-react` components (already a dependency). Keep bespoke brand marks (the wordmark) as SVG but mark them `aria-hidden` where decorative.

### 🟡 F-06 — `dangerouslySetInnerHTML` used for HTML entities

**Problem.** `footer.tsx`, `services-section.tsx`, `why-northbridge.tsx`, `dashboard-section.tsx`, `industries/page.tsx`, `resources/page.tsx` inject labels like `"Back Office &amp; Data"` via `dangerouslySetInnerHTML` purely to render `&amp;` / `&ndash;`. This is an unnecessary XSS surface and a code smell.

**Fix.** Store plain strings (`"Back Office & Data"`) and render as JSX children — React escapes `&` safely. Remove all `dangerouslySetInnerHTML` for static copy.

### 🟡 F-07 — Inconsistent button radii & no Button component

**Problem.** Pill (`rounded-full`) on marketing CTAs vs rounded-rect (`rounded-xl`) on auth submit vs token-pill (`rounded-full`) on `PageHeader`. With no `<Button>` primitive, each call site redefines padding, radius, hover, and disabled styles.

**Fix.** Add a `Button` component (`components/ui/button.tsx`) with `variant` (`primary` | `secondary` | `ghost`) and `size`, standardizing radius (recommend `rounded-full` for marketing, `rounded-xl` for dense app UI — or pick one). Refactor call sites.

### 🟡 F-08 — `hero.tsx` duplicates motion presets

**Problem.** `hero.tsx` defines local `container`/`item`/`float` variants instead of importing from `lib/motion-presets.ts`, causing slightly different durations (0.7s vs the standard 0.6s).

**Fix.** Import `staggerContainer` / `staggerItem` / `EASE_OUT`. Promote the `float` helper into `motion-presets.ts` if reused.

### 🟡 F-09 — No shared form/feedback primitives

**Problem.** No `Input`, `Badge`, `StatusBadge`, `Modal`, `Table`, `EmptyState`, `Spinner`, `Avatar` components. Each product page reinvents them.

**Fix.** Extract the patterns documented in [§7](#7-component-patterns--recipes) into `components/ui/*`. Prioritize `Input` (with label + error), `StatusBadge`, `EmptyState`, `Spinner`.

### ⚪ F-10 — Dead CSS utilities

**Problem.** `.animate-reveal` / `.revealed` and `.stagger-1`…`.stagger-10` in `globals.css` appear unused (the codebase uses motion's `staggerChildren` instead).

**Fix.** Verify with a usage search; remove if confirmed dead to reduce CSS weight and cognitive load.

### ⚪ F-11 — Weak focus indication

**Problem.** Interactive elements use `focus:outline-none focus:border-ink` (border-only) — low visibility for keyboard users; fails WCAG 2.4.7 (Focus Visible) in many cases.

**Fix.** Add a global `:focus-visible` ring (e.g. `outline: 2px solid var(--color-ink); outline-offset: 2px;`) in `@layer base`, and stop suppressing outline on elements that have no replacement.

### ⚪ F-12 — Decorative SVGs not `aria-hidden`; status-by-color-only

**Problem.** Marketing inline SVGs lack `aria-hidden="true"`; some status is conveyed by color/dot alone.

**Fix.** Add `aria-hidden` to decorative SVGs; pair color/dot indicators with visually-present or `sr-only` text.

---

## 15. Recommended Adoption Rules

To stop the drift and keep the system coherent, new code should follow these rules (codify in `AGENTS.md` if desired):

1. **Use semantic tokens, never raw hex.** `text-ink` not `text-[#0c0a09]`. Only use bracket-notation hex for genuinely ad-hoc colors not in the theme — and then add a token first.
2. **Use `lucide-react` for all icons.** No hand-written inline SVGs except brand wordmarks.
3. **Use the `lib/motion-presets.ts` variants.** Never redefine `fadeUp`/`staggerContainer`/`EASE_OUT` locally.
4. **No inline `style={{}}` for layout/spacing/typography.** Use Tailwind utilities. Reserve inline style for values motion genuinely requires (e.g. dynamic heights, gradient backgrounds).
5. **No `dangerouslySetInnerHTML` for static copy.** Write plain JSX text.
6. **Build shared primitives in `components/ui/`** (`Button`, `Input`, `Badge`, `EmptyState`) and consume them — don't reinvent per page.
7. **Card pattern:** `bg-white border border-hairline rounded-2xl p-5` (app) or `p-6` (marketing) — pick one default and document the exception.
8. **Respect reduced motion.** Never bypass `MotionConfig` with raw CSS keyframes that ignore `prefers-reduced-motion`.
9. **Provide a visible `:focus-visible` ring** on every interactive element.
10. **Serialize & gate** per `AGENTS.md` (server actions for client↔DB, role gating in the app layout).

---

## 16. Appendix: File Inventory

### 16.1 Design-token & global files

| File | Role |
|---|---|
| `app/globals.css` | `@theme inline` tokens, base layer, keyframe animations |
| `app/layout.tsx` | Font loading (`Inter`, `EB_Garamond`), `MotionConfig` wrapper |
| `lib/motion-presets.ts` | Shared motion variants + easing + viewport config |

### 16.2 Shared UI components

`components/dashboard/widgets.tsx`, `components/scroll-reveal.tsx`, `components/collapsible-card.tsx`, `components/app-sidebar.tsx`, `components/app-topbar.tsx`, `components/notification-bell.tsx`, `components/site-chrome.tsx`.

### 16.3 Marketing sections

`components/{hero,navbar,footer,trust-bar,services-section,stats-section,dashboard-section,why-northbridge,testimonials,case-study,cta-section,chatbot}.tsx`.

### 16.4 Product feature components

`components/{meeting-calendar,live-chat-inbox,user-chat,schedule-meeting-form}.tsx`.

### 16.5 Route surfaces

- Marketing pages: `app/{about,careers,contact,industries,resources,services}/page.tsx`, `app/page.tsx`
- App shell: `app/(app)/{dashboard,admin,support}/**`, `app/sign-in`, `app/sign-up`

---

*Document generated from a static audit of the repository. When the codebase changes, re-verify the token table (§2), the color-usage map (§5), and the findings (§14) against the current source.*
