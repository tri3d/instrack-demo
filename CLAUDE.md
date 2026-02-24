# CLAUDE.md — Instrack Demo

This file provides guidance for AI assistants working in this repository.

## Project Overview

**Instrack** is a railway infrastructure commissioning dashboard — a single-page React application that visualises the delivery status of track sections along a fictional rail line ("Millfield – Apex Terminal Line"). It tracks three delivery phases (Installation, Commissioning, Handover) across multiple track sections and renders an interactive schematic, KPI cards, and a Gantt-style schedule panel.

The application is entirely client-side with no backend, database, or authentication. All data is static mock data defined in `src/data/route.ts`.

---

## Tech Stack

| Concern | Tool / Version |
|---|---|
| Language | TypeScript 5.9 (strict mode) |
| Framework | React 19 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| UI primitives | Shadcn/ui (New York style) via Radix UI |
| Network diagram | @xyflow/react 12 (React Flow) |
| Charts | Recharts 3 |
| Icons | lucide-react |
| Linting | ESLint (flat config) with react-hooks + react-refresh |

---

## Development Commands

```bash
# Start the Vite dev server with HMR (http://localhost:5173)
npm run dev

# Type-check and compile to dist/
npm run build

# Serve the production build locally
npm run preview

# Run ESLint
npm run lint
```

There is **no test runner** configured. Do not add test scripts unless asked.

---

## Directory Structure

```
instrack-demo/
├── src/
│   ├── App.tsx                   # Root component; owns selectedSection state
│   ├── main.tsx                  # React entry point (renders <App />)
│   ├── index.css                 # Global design tokens + Tailwind base
│   ├── App.css                   # App-level styles (currently minimal)
│   │
│   ├── data/
│   │   └── route.ts              # ALL mock data: nodes, sections, logistics
│   │
│   ├── types/
│   │   └── index.ts              # Core domain interfaces and type aliases
│   │
│   ├── lib/
│   │   ├── status.ts             # STATUS enum, colours, labels, deriveOverallStatus()
│   │   └── utils.ts              # cn() — Tailwind class merge helper
│   │
│   └── components/
│       ├── layout/
│       │   ├── Topbar.tsx        # Header bar: branding, legend, export button, timestamp
│       │   └── ProjectHealthBar.tsx  # Segmented progress bar across all phases
│       │
│       ├── schematic/
│       │   ├── TrackSchematic.tsx  # React Flow canvas; lays out nodes + edges
│       │   ├── StationNode.tsx     # Diamond-shaped station/junction custom node
│       │   ├── LogisticsNode.tsx   # Logistics marker (railhead, power, road access)
│       │   └── TrackEdge.tsx       # Custom SVG edge: rails + sleeper ties
│       │
│       ├── kpi/
│       │   ├── KpiBar.tsx          # Two-column KPI area: stat cards + phase chart
│       │   └── PhaseProgress.tsx   # Horizontal stacked bar for phase breakdown
│       │
│       ├── schedule/
│       │   └── SchedulePanel.tsx   # Slide-up panel with Gantt chart for a section
│       │
│       └── ui/                   # Shadcn primitives (badge, card, separator, tooltip)
│           ├── badge.tsx
│           ├── card.tsx
│           ├── separator.tsx
│           └── tooltip.tsx
│
├── public/                       # Static assets served as-is
├── index.html                    # HTML shell
├── package.json
├── vite.config.ts                # Vite config: React + Tailwind plugins, @ alias
├── tsconfig.json                 # References tsconfig.app.json; sets @ path alias
├── tsconfig.app.json             # Strict TypeScript for src/
├── eslint.config.js              # Flat ESLint config
└── components.json               # Shadcn CLI configuration (New York style)
```

---

## Core Domain Model (`src/types/index.ts`)

```ts
// The four delivery statuses used throughout the app
type Status = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "BLOCKED"

// A physical node on the schematic (station, junction, depot)
interface RouteNode { id, label, km, type: NodeType }

// A track segment between two RouteNodes
interface TrackSection {
  id, from, to, label, length, type: TrackType
  installation: Status
  commissioning: Status
  handover: Status
  schedule: SectionSchedule
}

// Gantt dates for one phase of one section
interface PhaseSchedule {
  plannedStart, plannedEnd: string   // "YYYY-MM-DD"
  actualStart, actualEnd: string | null
}

// An ancillary logistics marker on the schematic
interface LogisticsPoint { id, label, type: LogisticsType, km, notes }
```

---

## Status System (`src/lib/status.ts`)

The `STATUS` const-object is the single source of truth for status values. Use it everywhere instead of raw strings.

```ts
import { STATUS, STATUS_COLOUR, STATUS_BG, STATUS_LABEL, deriveOverallStatus } from "@/lib/status"
```

| Export | Purpose |
|---|---|
| `STATUS` | Const object with the four status keys |
| `STATUS_COLOUR` | Foreground hex colours for SVG / inline styles |
| `STATUS_BG` | Background tint hex colours for badges |
| `STATUS_LABEL` | Human-readable labels |
| `deriveOverallStatus(i, c, h)` | Returns worst/most-progressed status from three phases |

The colour values are **plain hex strings**, not CSS variables, so they can be used in SVG `fill`/`stroke` attributes as well as in inline styles.

---

## Styling Conventions

### Design tokens (CSS custom properties)

All colours are defined in `src/index.css` as CSS custom properties on `:root`. Never hardcode a colour that already has a token.

Key tokens:
```
--bg-base          Background of the page
--bg-card          Surface colour for cards / panels
--bg-elevated      Slightly lighter surface
--border-subtle    Faint dividers
--border-strong    Prominent dividers / outlines
--text-primary     Body text
--text-muted       Secondary / disabled text
--font-mono        JetBrains Mono (monospace)
--font-display     Barlow Condensed (headings)
--status-complete  Green (#22c55e)
--status-progress  Amber (#f59e0b)
--status-blocked   Red (#ef4444)
--status-none      Slate (#4a6080)
```

### Inline styles vs Tailwind

- **Layout and spacing** (flex, gap, padding, etc.) often use inline `style={{}}` objects — this is intentional for readability in complex visualisation components.
- **Utility classes** (rounded, shadow, etc.) from Tailwind are used for simpler element-level tweaks.
- **Shadcn components** are used as-is for standard UI primitives; override with `className` or inline styles, never by editing `src/components/ui/`.
- Use the `cn()` helper (`@/lib/utils`) to merge conditional Tailwind classes safely.

---

## State Management

State is minimal and entirely local to `App.tsx`:

```ts
const [selectedSection, setSelectedSection] = useState<TrackSection | null>(null)
```

- `selectedSection` drives both the KPI column (right side of KpiBar) and the SchedulePanel.
- `TrackSchematic` receives `selectedSectionId` (string | null) and `onSelectSection` as props.
- `SchedulePanel` receives `section`, `onClose`, and `onNavigate` and is only rendered when a section is selected.

There is no global state library. Do not introduce Redux, Zustand, or Context unless explicitly asked.

---

## React Flow (Schematic)

`TrackSchematic.tsx` owns the React Flow canvas. Key points:

- **Custom node types** are registered as `nodeTypes` inside the component with `useMemo` to prevent re-registration on each render.
- **Custom edge types** are registered as `edgeTypes` similarly.
- `StationNode` and `LogisticsNode` receive their data via the React Flow `data` prop.
- `TrackEdge` renders a two-rail SVG path with cross-tie sleepers; it reads section status from `data.section` to colour the rails.
- Node and edge positions are computed from `km` values in `route.ts` via a simple linear layout function inside `TrackSchematic`.

---

## Data (`src/data/route.ts`)

All mock data lives here. To add or modify track sections, nodes, or logistics points, edit this file. The shape must conform to the types in `src/types/index.ts`.

Dates use ISO format `"YYYY-MM-DD"`. `actualStart`/`actualEnd` may be `null` for phases not yet started.

---

## Adding a New Component

1. Place it in the relevant subdirectory under `src/components/` (create a new directory for a new feature domain).
2. Use `import type` for type-only imports.
3. Use the `@/` path alias for all imports from `src/`.
4. Apply status colours via `STATUS_COLOUR`/`STATUS_BG` from `@/lib/status`, not via hardcoded hex.
5. Apply theme colours via CSS custom properties (`var(--bg-card)`, etc.).
6. Do not add `console.log` statements to production code.

---

## Adding a New Track Section

Edit `src/data/route.ts`:
1. Optionally add any new `RouteNode` entries to `routeNodes`.
2. Add a `TrackSection` object to `trackSections` with a unique `id` and valid `from`/`to` node IDs.
3. Populate all three phase statuses and a `schedule` with planned dates.

No other files need editing — the schematic, KPI, and health bar all derive their data from `trackSections` at runtime.

---

## Conventions Summary

| Topic | Convention |
|---|---|
| Language | TypeScript strict mode; use `import type` for type-only imports |
| Naming | PascalCase components, camelCase variables/functions, UPPER_CASE constants |
| Imports | Use `@/` alias for all `src/` imports |
| Status values | Always use `STATUS.*` constants, never raw strings |
| Colours | CSS custom properties for theme colours; `STATUS_COLOUR` for status SVG colours |
| State | Local `useState` only; no global state library |
| UI primitives | Shadcn components in `src/components/ui/` — consume but do not edit |
| No testing | No test runner is set up; do not add test files unless asked |
| No backend | Fully client-side; no fetch calls, no API keys, no env vars |
| Build output | `dist/` — ignored by git |
