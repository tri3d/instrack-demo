# Instrack Design System

> Last updated: 2026-02-23
> Applied in: `src/index.css` (`:root` block), `src/lib/status.ts`

---

## Surface hierarchy

Three visible layers — the eye reads depth immediately:

| Layer        | Token             | Hex       | Used for                                  |
|--------------|-------------------|-----------|-------------------------------------------|
| Base         | `--bg-base`       | `#0b1120` | Page background, KPI section background  |
| Panel        | `--bg-panel`      | `#111827` | Topbar, schematic canvas                  |
| Card         | `--bg-card`       | `#1a2236` | KPI cards, schedule panel                 |
| Card hover   | `--bg-card-hover` | `#1f2a42` | KPI card hover, selection context banner  |
| Inset        | `--bg-inset`      | `#0f1729` | Chart backgrounds, schedule header strip  |

---

## Border tokens

| Token              | Hex       | Used for                              |
|--------------------|-----------|---------------------------------------|
| `--border-strong`  | `#2d3f5c` | Panel edges, section dividers         |
| `--border-soft`    | `#1e2d45` | Subtle dividers inside panels         |
| `--border-accent`  | `#334466` | Gantt planned bars, highlighted edges |

---

## Text tokens

| Token              | Hex       | Used for                              |
|--------------------|-----------|---------------------------------------|
| `--text-primary`   | `#e8edf5` | Main content, headings, values        |
| `--text-secondary` | `#8fa3be` | Labels, captions, project title       |
| `--text-muted`     | `#4a6080` | Placeholders, disabled, timestamps   |

---

## Status colours

Stored as both JS constants in `src/lib/status.ts` (for SVG attributes) and CSS variables (for DOM elements).

| Status       | Colour               | Hex       | Background           | Hex       |
|--------------|----------------------|-----------|----------------------|-----------|
| Complete     | `--status-complete`  | `#22c55e` | `--status-complete-bg` | `#0f2e1a` |
| In Progress  | `--status-progress`  | `#f59e0b` | `--status-progress-bg` | `#2a1f08` |
| Blocked      | `--status-blocked`   | `#ef4444` | `--status-blocked-bg`  | `#2a0f0f` |
| Not Started  | `--status-none`      | `#4a6080` | `--status-none-bg`     | `#131f30` |

Usage:
- `STATUS_COLOUR[status]` — foreground hex, use in SVG `stroke`/`fill` and CSS `color`
- `STATUS_BG[status]` — background hex, use in badge backgrounds, banner tints

---

## Accent colours

| Token            | Hex       | Used for                                     |
|------------------|-----------|----------------------------------------------|
| `--accent`       | `#3b82f6` | Instrack brand blue — "track" wordmark, links |
| `--accent-amber` | `#f59e0b` | Logistics node markers, Gantt today line      |

---

## Typography

| Role            | Font                  | Size  | Weight | Token               |
|-----------------|-----------------------|-------|--------|---------------------|
| Body / labels   | JetBrains Mono        | 11px+ | 400    | `--font-mono`       |
| Display / KPIs  | Barlow Condensed      | 34px  | 700    | `--font-display`    |
| Section headers | Barlow Condensed      | 15px  | 700    | `--font-display`    |
| Captions        | JetBrains Mono        | 11px  | 400    | —                   |

Minimum label size: **11px** (was 9px — too hard to read).

---

## Component-by-component rules

### Topbar
- `background: var(--bg-panel)` — lighter than base, reads as a surface
- `border-bottom: 1px solid var(--border-strong)`
- Wordmark: `ins` → `--text-secondary`, `track` → `--accent` (blue, not amber)
- Status badges: `background: STATUS_BG[status]`, `border: STATUS_COLOUR[status]60`

### Schematic canvas
- Outer container: CSS `linear-gradient` creates a subtle 16px inset band at ~60% height (rail bed)
- `<ReactFlow style={{ background: "transparent" }}>` — shows the gradient through
- Dot grid: `color: var(--border-soft)` — visible but low contrast
- Controls: `var(--bg-card)` / `var(--border-strong)`
- MiniMap: `var(--bg-panel)` / `var(--border-strong)`

### Station nodes
- Diamond fill: `var(--bg-panel)` (not black — matches the canvas surface)
- Diamond border: `STATUS_COLOUR[worstAdjacentStatus]` — 2px
- Box shadow glow: `${colour}50` (30% opacity halo)
- Label: `--text-primary`, km: `--text-muted`

### Logistics nodes
- Pill background: `var(--bg-card)`
- Border: `var(--border-strong)`
- Icon + text: `var(--accent-amber)`
- Connector line: `var(--accent-amber)` at 35% opacity, dashed

### Track edges
- Rails: status colour at **90% opacity** when not selected, 100% when selected
- Sleepers: `#2d3f5c` (border-strong) at **40% opacity** when not selected, status colour at 90% when selected
- Glow filter on select: `feGaussianBlur stdDeviation=4`

### KPI cards
- `background: var(--bg-card)`, `border: 1px solid var(--border-soft)`
- Bottom accent strip: `3px solid STATUS_COLOUR[status]`
- Hover: `var(--bg-card-hover)`, `var(--border-accent)`
- `box-shadow: 0 2px 8px rgba(0,0,0,0.4)`
- Value: 34px Barlow Condensed, status colour (or `--text-primary` for total)
- Label: 11px JetBrains Mono, `--text-muted`
- Selection banner (when filtered): `var(--bg-card-hover)`, `border-left: 3px solid STATUS_COLOUR`

### Phase breakdown bars
- Outer wrapper: `var(--bg-inset)` rounded container
- Bar colours: hex values from status.ts (CSS vars don't work in Recharts SVG)
- Stack order back→front: NOT_STARTED → BLOCKED → IN_PROGRESS → COMPLETE
- YAxis labels: `--text-secondary`
- Tooltip: `var(--bg-card)` / `var(--border-strong)`

### Schedule panel
- Panel: `var(--bg-card)`, `border-top: var(--border-strong)`
- Header strip: `var(--bg-inset)`, `border-bottom: var(--border-soft)`
- Section title: 15px Barlow Condensed, `--text-primary`
- Status badge: `STATUS_BG[overall]` bg, `STATUS_COLOUR[overall]60` border
- Gantt area: `var(--bg-inset)` container
- Planned bars: `#334466` (border-accent hex)
- Actual bars: `STATUS_COLOUR[phaseStatus]`
- Today line: `#f59e0b` (accent-amber), dashed
- Overdue flag: `var(--status-blocked)`
- Close button: `--text-muted` → hover `--text-primary`

---

## Implementation note — CSS vars in SVG

Recharts and React Flow render SVG elements where `fill` and `stroke` are SVG **attributes** (not CSS properties). CSS custom properties are only resolved in CSS context, not SVG attribute context. Therefore:

- Use **hex values** (from `STATUS_COLOUR` / `STATUS_BG` in `status.ts`) for any SVG `fill`/`stroke` attributes
- Use **`var(--token)`** strings for DOM element `style.color`, `style.background`, `style.borderColor` etc.
- This is why `PhaseProgress` has both `PHASE_COLOURS` (CSS var strings, for reference) and `PHASE_COLOURS_HEX` (hex, for Recharts)
