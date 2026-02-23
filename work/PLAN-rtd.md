# Instrack Demo — Claude Code Build Plan

> Railway construction & commissioning progress dashboard
> Stack: Vite + React + TypeScript + React Flow + Shadcn/ui + Recharts
> Target: Vercel deployment at `instrack-demo.vercel.app`

---

## Project Context

Instrack is a construction and commissioning progress tracker for linear railway projects.
The demo covers a single route with multiple nodes (stations/junctions) connected by track
sections. Each section has three independently tracked phases: Installation, Commissioning,
and Handover. Logistics overlay points (railhead, road access, power source) sit above the
schematic. Clicking a section opens a schedule panel below the KPIs.

This is a Vite demo. A production version will use Next.js App Router.

---

## Directory Structure

```
instrack-demo/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Topbar.tsx
│   │   ├── schematic/
│   │   │   ├── TrackSchematic.tsx       # React Flow canvas
│   │   │   ├── StationNode.tsx          # Custom RF node - station/junction
│   │   │   ├── LogisticsNode.tsx        # Custom RF node - railhead/road/power
│   │   │   └── TrackEdge.tsx            # Custom RF edge - coloured by status
│   │   ├── kpi/
│   │   │   ├── KpiBar.tsx               # Row of summary cards
│   │   │   └── PhaseProgress.tsx        # Recharts phase completion bars
│   │   └── schedule/
│   │       └── SchedulePanel.tsx        # SVG Gantt, shown on section select
│   ├── data/
│   │   └── route.ts                     # All nodes, sections, logistics, schedule data
│   ├── lib/
│   │   └── status.ts                    # Status constants, colours, derived helpers
│   ├── types/
│   │   └── index.ts                     # Shared TypeScript interfaces and types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── PLAN.md
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Status System

Four statuses apply independently to each phase of each section:

| Status       | Colour  | Meaning                              |
|--------------|---------|--------------------------------------|
| NOT_STARTED  | Grey    | Work not yet begun                   |
| IN_PROGRESS  | Amber   | Actively under way                   |
| COMPLETE     | Green   | Phase signed off                     |
| BLOCKED      | Red     | Impediment preventing progress       |

Overall section status is derived: BLOCKED > IN_PROGRESS > NOT_STARTED, COMPLETE only when all three phases complete.

---

## Data Model (`src/data/route.js`)

### Nodes
```js
{
  id: "A",
  label: "Millfield Jn",
  km: 0.0,
  type: "station" | "junction" | "depot"
}
```

### Sections (React Flow edges)
```js
{
  id: "S1",
  from: "A",
  to: "B",
  label: "S1",
  length: "2.4 km",
  type: "Ballasted" | "Slab Track" | "Elevated" | "Tunnel",
  installation:  STATUS,
  commissioning: STATUS,
  handover:      STATUS,
  schedule: {
    installation:  { plannedStart, plannedEnd, actualStart, actualEnd },
    commissioning: { plannedStart, plannedEnd, actualStart, actualEnd },
    handover:      { plannedStart, plannedEnd, actualStart, actualEnd },
  }
}
```

### Logistics Points (React Flow nodes, different type)
```js
{
  id: "L1",
  label: "Eastway Railhead",
  type: "railhead" | "road_access" | "power_source",
  km: 7.2,
  notes: "Primary delivery point for track panels"
}
```

---

## Component Specifications

### 1. Topbar (`components/layout/Topbar.jsx`)
- Instrack wordmark left — monospace, amber accent on the "track" portion
- Project name centre — "MILLFIELD — APEX TERMINAL LINE"
- Status legend right — coloured dot + label for each of the 4 statuses
- Last updated timestamp far right
- Use Shadcn `Badge` for status counts (e.g. "2 BLOCKED")
- Dark background `#080f18`, border-bottom `#1f2937`

### 2. Track Schematic (`components/schematic/TrackSchematic.jsx`)
- React Flow canvas, `fitView` on load, zoom/pan enabled
- Nodes positioned by chainage (km) mapped to X axis, fixed Y
- `nodesDraggable={false}`, `nodesConnectable={false}` — read only
- Custom node types: `stationNode`, `logisticsNode`
- Custom edge type: `trackEdge`
- MiniMap bottom-right, styled dark
- Controls top-left
- Background: dot grid, dark

#### StationNode (`components/schematic/StationNode.jsx`)
- Diamond shape (rotated square) with label above, km chainage below
- Border colour reflects overall section status of adjacent edges
- Tooltip on hover: name, km, connected sections

#### LogisticsNode (`components/schematic/LogisticsNode.jsx`)
- Sits above the track line (offset Y)
- Icon by type: ▲ railhead, ⊕ road access, ⚡ power source
- Dashed vertical connector line down to track Y position
- Amber/neutral colour — not status-driven
- Tooltip on hover: label, type, notes

#### TrackEdge (`components/schematic/TrackEdge.jsx`)
- Custom SVG path along the track line
- Draws two parallel rails with sleeper tick marks between them
- Stroke colour = overall section status colour
- Glows when selected (SVG filter)
- Section label midpoint above edge
- Status dot midpoint below edge
- onClick → sets selected section in App state

### 3. KPI Bar (`components/kpi/KpiBar.jsx`)
- Row of 4 Shadcn Cards: Total Sections, Complete, In Progress, Blocked
- Numbers large, coloured by status
- Below the cards: PhaseProgress component

#### PhaseProgress (`components/kpi/PhaseProgress.jsx`)
- Recharts `BarChart` horizontal or three stacked progress bars
- One bar per phase: Installation / Commissioning / Handover
- Segments: Complete (green) | In Progress (amber) | Blocked (red) | Not Started (grey)
- Shows n/total label on right

### 4. Schedule Panel (`components/schedule/SchedulePanel.jsx`)
- Renders only when a section is selected (selectedSection !== null)
- Slides in below KPI bar with CSS transition
- Header: section ID, name, length, track type, overall status badge
- SVG Gantt chart:
  - Y axis: three rows — Installation, Commissioning, Handover
  - X axis: date range spanning project start → planned end
  - Planned bar: muted background bar
  - Actual bar: status-coloured solid bar overlaid
  - Today line: vertical amber dashed line
  - Overdue indicator: red flag if actual end > planned end
- Milestone markers for key sign-off dates if present in data
- Close button top-right

---

## Build Phases

### Phase 1 — Scaffold & Branding
- [ ] Vite + React initialised
- [ ] Tailwind CSS configured
- [ ] Shadcn/ui initialised (`npx shadcn@latest init`) — TypeScript: Yes
- [ ] Shadcn components added: `card`, `badge`, `separator`, `tooltip`
- [ ] React Flow installed (`@xyflow/react`)
- [ ] Recharts installed
- [ ] `src/lib/status.ts` written with STATUS constants, colour map, and exported types
- [ ] `src/types/index.ts` written with interfaces: `RouteNode`, `TrackSection`, `LogisticsPoint`, `PhaseSchedule`, `Status`
- [ ] `src/data/route.ts` written with full mock dataset (6 nodes, 5 sections, 3 logistics points, schedule dates)
- [ ] Topbar component complete with Instrack branding

### Phase 2 — React Flow Schematic
- [ ] `TrackSchematic.jsx` — React Flow canvas with fitView and dark background
- [ ] `StationNode.jsx` — diamond node, hover tooltip
- [ ] `LogisticsNode.jsx` — icon marker with dashed connector
- [ ] `TrackEdge.jsx` — dual-rail SVG edge with sleepers, status colour, glow on select
- [ ] Edge click wires selectedSection state up to App
- [ ] MiniMap and Controls added

### Phase 3 — KPI & Progress
- [ ] `KpiBar.jsx` — four summary cards
- [ ] `PhaseProgress.jsx` — Recharts phase bars
- [ ] Both respond reactively to selectedSection (highlight relevant stats)

### Phase 4 — Schedule Panel
- [ ] `SchedulePanel.jsx` — SVG Gantt, planned vs actual bars
- [ ] Today line rendered at correct relative position
- [ ] Overdue flags
- [ ] Slide-in animation on section select
- [ ] Dismissable, returns to overview state

### Phase 5 — Polish & Deploy
- [ ] Responsive layout check (target 1280px+ desktop)
- [ ] Consistent colour tokens via CSS variables
- [ ] `instrack-demo` repo pushed to GitHub
- [ ] Vercel project created, auto-deploy from main
- [ ] Check live URL, share with colleague

---

## Key Design Decisions

- **No external API or auth** — all data in `src/data/route.js`, static for demo
- **Read-only schematic** — no drag/edit in this version
- **Desktop-first** — 1280px minimum target, no mobile breakpoints needed for demo
- **Dark theme throughout** — `#060d14` base, amber `#d97706` primary accent
- **Monospace font** — JetBrains Mono or similar for all data/labels
- **Display font** — consider a condensed sans for headings (e.g. Barlow Condensed)

---

## Future Roadmap (not in demo)

- GIS view: MapLibre GL JS schematic over real route geometry
- Live data: connect to project management API or spreadsheet source
- Edit mode: update phase statuses inline with audit log
- Multi-route: project selector in topbar
- Export: PDF report from current state
- Next.js migration: App Router, server components, proper DB

---

## Notes for Claude Code

- Always check `src/lib/status.ts` before hardcoding any colour or status string
- All shared interfaces live in `src/types/index.ts` — import from there, never redefine inline
- All mock data lives in `src/data/route.ts` — do not scatter data into components
- React Flow nodes must be memoized with `React.memo` to avoid re-render loops
- React Flow requires a parent element with explicit height — use `h-screen` or fixed px
- Type custom React Flow nodes using `NodeProps<YourDataType>` from `@xyflow/react`
- Type custom React Flow edges using `EdgeProps` from `@xyflow/react`
- Shadcn components live in `src/components/ui/` — do not edit these directly
- When adding Recharts, wrap in a `ResponsiveContainer` with `width="100%" height={n}`
- The schedule SVG Gantt should derive its date scale from the data, not hardcode dates
- Avoid `any` — use `unknown` and narrow, or define proper types in `src/types/index.ts`
- Set `"strict": true` in tsconfig and keep it — do not disable strict mode to silence errors
