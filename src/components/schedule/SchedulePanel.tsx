import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip as ReTooltip,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { deriveOverallStatus, STATUS, STATUS_COLOUR, STATUS_BG, STATUS_LABEL } from "@/lib/status"
import { PROJECT_START, PROJECT_END } from "@/data/route"
import type { TrackSection, PhaseSchedule } from "@/types"

interface SchedulePanelProps {
  section:    TrackSection
  onClose:    () => void
  onNavigate: (direction: "prev" | "next") => void
}

// ─── Date helpers ──────────────────────────────────────────────────────────

function toMs(dateStr: string | null): number {
  return dateStr ? new Date(dateStr).getTime() : 0
}

const projectStart = toMs(PROJECT_START)
const projectEnd   = toMs(PROJECT_END)
const projectSpan  = projectEnd - projectStart

function msToTick(ms: number): number {
  return ((ms - projectStart) / projectSpan) * 100
}

function buildGanttData(label: string, sched: PhaseSchedule, colour: string) {
  const ps  = toMs(sched.plannedStart)
  const pe  = toMs(sched.plannedEnd)
  const as_ = sched.actualStart ? toMs(sched.actualStart) : null
  const ae  = sched.actualEnd   ? toMs(sched.actualEnd)   : null

  const plannedStart = msToTick(ps)
  const plannedWidth = msToTick(pe) - plannedStart
  const actualStart  = as_ ? msToTick(as_) : null
  const actualWidth  = as_
    ? (ae ? msToTick(ae) : msToTick(Date.now() > pe ? pe : Date.now())) - msToTick(as_)
    : null
  const isOverdue    = ae === null && as_ !== null && Date.now() > pe

  return {
    phase: label,
    plannedGap:   plannedStart,
    plannedWidth,
    actualGap:    actualStart ?? 0,
    actualWidth:  actualWidth ?? 0,
    hasActual:    as_ !== null,
    isOverdue,
    colour,
    tooltip: {
      plannedStart: sched.plannedStart,
      plannedEnd:   sched.plannedEnd,
      actualStart:  sched.actualStart,
      actualEnd:    sched.actualEnd,
    },
  }
}

const TODAY_TICK = msToTick(Date.now())

// ─── Month / year tick data ────────────────────────────────────────────────

const MONTH_LABELS: Record<number, string> = {}
const YEAR_TICKS = new Set<number>()

;(() => {
  const start = new Date(PROJECT_START)
  const end   = new Date(PROJECT_END)
  let d = new Date(start.getFullYear(), start.getMonth(), 1)
  while (d <= end) {
    const tick    = ((d.getTime() - projectStart) / projectSpan) * 100
    const rounded = Math.round(tick * 10) / 10
    MONTH_LABELS[rounded] = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
    if (d.getMonth() === 0 && rounded > 1) YEAR_TICKS.add(rounded)
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  }
})()

const MONTH_TICKS = Object.keys(MONTH_LABELS).map(Number).sort((a, b) => a - b)

function xAxisTick(value: number): string {
  return MONTH_LABELS[Math.round(value * 10) / 10] ?? ""
}

function tickToYear(tick: number): string {
  return String(new Date((tick / 100) * projectSpan + projectStart).getFullYear())
}

// ─── Custom tooltip ────────────────────────────────────────────────────────

function GanttTooltip({ active, payload }: { active?: boolean; payload?: unknown[] }) {
  if (!active || !payload?.length) return null
  const entry = payload[0] as { payload: ReturnType<typeof buildGanttData> }
  const d = entry.payload
  return (
    <div
      className="rounded border p-2 font-mono"
      style={{
        background:  "var(--bg-card)",
        borderColor: "var(--border-strong)",
        color:       "var(--text-primary)",
        fontSize:    "11px",
      }}
    >
      <div className="font-semibold mb-1">{d.phase}</div>
      <div style={{ color: "var(--text-secondary)" }}>
        Planned: {d.tooltip.plannedStart} → {d.tooltip.plannedEnd}
      </div>
      {d.tooltip.actualStart && (
        <div style={{ color: d.colour }}>
          Actual: {d.tooltip.actualStart} → {d.tooltip.actualEnd ?? "ongoing"}
        </div>
      )}
      {d.isOverdue && (
        <div style={{ color: "var(--status-blocked)", marginTop: "4px", fontWeight: 600 }}>
          ⚠ Overdue
        </div>
      )}
    </div>
  )
}

// ─── Milestone helper ──────────────────────────────────────────────────────

function getNextMilestone(section: TrackSection) {
  const phases = [
    { name: "Installation",  status: section.installation,  plannedEnd: section.schedule.installation.plannedEnd  },
    { name: "Commissioning", status: section.commissioning, plannedEnd: section.schedule.commissioning.plannedEnd },
    { name: "Handover",      status: section.handover,      plannedEnd: section.schedule.handover.plannedEnd      },
  ]
  return phases.find((p) => p.status === STATUS.NOT_STARTED || p.status === STATUS.IN_PROGRESS) ?? null
}

// ─── Completion forecast ───────────────────────────────────────────────────

function computeForecast(section: TrackSection) {
  const phases = [
    section.schedule.installation,
    section.schedule.commissioning,
    section.schedule.handover,
  ]

  const now = Date.now()
  let latestMs   = 0
  let hasOverrun = false

  for (const phase of phases) {
    const pe  = new Date(phase.plannedEnd).getTime()
    const ae  = phase.actualEnd   ? new Date(phase.actualEnd).getTime()   : null
    const as_ = phase.actualStart ? new Date(phase.actualStart).getTime() : null

    if (ae !== null) {
      latestMs = Math.max(latestMs, Math.max(pe, ae))
    } else if (as_ !== null && now > pe) {
      latestMs   = Math.max(latestMs, now)
      hasOverrun = true
    } else {
      latestMs = Math.max(latestMs, pe)
    }
  }

  const isBlocked = [section.installation, section.commissioning, section.handover]
    .some((s) => s === STATUS.BLOCKED)

  const dateLabel = new Date(latestMs).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })

  return { dateLabel, hasOverrun, isBlocked }
}

// ─── Nav button ────────────────────────────────────────────────────────────

interface NavBtnProps {
  label:   string
  onClick: () => void
}

function NavBtn({ label, onClick }: NavBtnProps) {
  return (
    <button
      onClick={onClick}
      className="font-mono"
      style={{
        fontSize:     "13px",
        color:        "var(--text-secondary)",
        border:       "1px solid var(--border-soft)",
        background:   "var(--bg-inset)",
        padding:      "2px 9px",
        borderRadius: "4px",
        cursor:       "pointer",
        lineHeight:   "1.5",
        transition:   "color 0.15s, border-color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.color = "var(--text-primary)"
        el.style.borderColor = "var(--border-strong)"
        el.style.background = "var(--bg-panel)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.color = "var(--text-secondary)"
        el.style.borderColor = "var(--border-soft)"
        el.style.background = "var(--bg-inset)"
      }}
    >
      {label}
    </button>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function SchedulePanel({ section, onClose, onNavigate }: SchedulePanelProps) {
  const overall = deriveOverallStatus(section.installation, section.commissioning, section.handover)
  const colour  = STATUS_COLOUR[overall]

  const ganttData = [
    buildGanttData("Installation",  section.schedule.installation,  STATUS_COLOUR[section.installation]),
    buildGanttData("Commissioning", section.schedule.commissioning, STATUS_COLOUR[section.commissioning]),
    buildGanttData("Handover",      section.schedule.handover,      STATUS_COLOUR[section.handover]),
  ]

  const nextMilestone = getNextMilestone(section)
  const forecast      = computeForecast(section)

  return (
    <div
      className="shrink-0 animate-in slide-in-from-bottom-2 duration-200"
      style={{
        background:   "var(--bg-card)",
        border:       "1px solid var(--border-strong)",
        borderRadius: "8px",
        overflow:     "hidden",
      }}
    >
      {/* Header strip */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          background:   "var(--bg-inset)",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        {/* Left: section info */}
        <div className="flex items-center gap-3">
          <span
            style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "15px",
              fontWeight:    700,
              color:         "var(--text-primary)",
              letterSpacing: "0.02em",
            }}
          >
            Section {section.id}
          </span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {section.length} · {section.type}
          </span>
          <Badge
            variant="outline"
            className="font-mono"
            style={{
              fontSize:    "11px",
              borderColor: colour + "60",
              color:       colour,
              background:  STATUS_BG[overall],
              padding:     "1px 8px",
            }}
          >
            {STATUS_LABEL[overall]}
          </Badge>
        </div>

        {/* Right: nav + close */}
        <div className="flex items-center gap-2">
          <NavBtn label="←" onClick={() => onNavigate("prev")} />
          <NavBtn label="→" onClick={() => onNavigate("next")} />

          <button
            onClick={onClose}
            className="rounded px-3 py-1 font-mono"
            style={{
              fontSize:    "11px",
              color:       "var(--text-muted)",
              border:      "1px solid var(--border-soft)",
              background:  "transparent",
              cursor:      "pointer",
              transition:  "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.color = "var(--text-primary)"
              el.style.borderColor = "var(--border-strong)"
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.color = "var(--text-muted)"
              el.style.borderColor = "var(--border-soft)"
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Gantt chart area */}
      <div className="px-6 py-6">
        <div
          className="rounded-md overflow-hidden"
          style={{ background: "var(--bg-inset)", padding: "8px 8px 8px" }}
        >
          <ResponsiveContainer width="100%" height={190}>
            {/* key forces remount on section change, re-triggering bar entry animation */}
            <BarChart
              key={section.id}
              data={ganttData}
              layout="vertical"
              margin={{ top: 22, right: 16, bottom: 4, left: 90 }}
              barCategoryGap="30%"
              barSize={14}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                ticks={MONTH_TICKS}
                tickFormatter={xAxisTick}
                tick={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace", fill: "#4a6080" }}
                axisLine={{ stroke: "#2d3f5c" }}
                tickLine={false}
                interval={1}
                orientation="top"
              />
              <YAxis
                type="category"
                dataKey="phase"
                tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", fill: "#8fa3be" }}
                width={82}
                axisLine={false}
                tickLine={false}
              />
              <ReTooltip content={<GanttTooltip />} cursor={false} />

              {/* Month gridlines */}
              {MONTH_TICKS.map((tick) => {
                const isYear = YEAR_TICKS.has(tick)
                return (
                  <ReferenceLine
                    key={`grid-${tick}`}
                    x={tick}
                    stroke={isYear ? "#2d3f5c" : "#1e2d45"}
                    strokeWidth={1}
                    label={isYear ? {
                      value:      tickToYear(tick),
                      position:   "insideTopLeft",
                      fontSize:   9,
                      fontFamily: "JetBrains Mono, monospace",
                      fill:       "#8fa3be",
                      offset:     4,
                    } : undefined}
                  />
                )
              })}

              {/* Today line */}
              {TODAY_TICK >= 0 && TODAY_TICK <= 100 && (
                <ReferenceLine
                  x={TODAY_TICK}
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  label={{
                    value:      "Today",
                    position:   "insideBottomRight",
                    fontSize:   9,
                    fontFamily: "JetBrains Mono, monospace",
                    fill:       "#f59e0b",
                  }}
                />
              )}

              {/* Planned bars */}
              <Bar dataKey="plannedGap"   stackId="planned" fill="transparent" isAnimationActive={false} />
              <Bar
                dataKey="plannedWidth"
                stackId="planned"
                radius={[2, 2, 2, 2]}
                isAnimationActive={true}
                animationDuration={500}
                animationEasing="ease-out"
                animationBegin={0}
              >
                {ganttData.map((_, i) => <Cell key={i} fill="#334466" />)}
              </Bar>

              {/* Actual bars — staggered 150ms per row via animationBegin on each entry */}
              <Bar dataKey="actualGap"   stackId="actual" fill="transparent" isAnimationActive={false} />
              <Bar
                dataKey="actualWidth"
                stackId="actual"
                radius={[2, 2, 2, 2]}
                isAnimationActive={true}
                animationDuration={500}
                animationEasing="ease-out"
                animationBegin={150}
              >
                {ganttData.map((entry, i) => (
                  <Cell key={i} fill={entry.hasActual ? entry.colour : "transparent"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Next milestone callout */}
        <div
          className="mt-3 font-mono"
          style={{
            background:   "var(--bg-inset)",
            borderLeft:   "3px solid var(--accent)",
            borderRadius: "4px",
            padding:      "8px 12px",
            fontSize:     "11px",
            color:        "var(--text-secondary)",
          }}
        >
          {nextMilestone ? (
            <>
              <span style={{ color: "var(--accent)" }}>▶</span>
              {" Next milestone: "}
              <strong style={{ color: "var(--text-primary)" }}>{nextMilestone.name}</strong>
              {" · due "}
              <span style={{ color: "var(--text-primary)" }}>{nextMilestone.plannedEnd}</span>
            </>
          ) : (
            <span style={{ color: STATUS_COLOUR.COMPLETE }}>✓ All phases complete</span>
          )}
        </div>

        {/* Projected completion */}
        <div className="flex items-center gap-2 mt-3 font-mono" style={{ fontSize: "11px" }}>
          {forecast.isBlocked && (
            <span style={{ color: "var(--status-blocked)" }}>⚠</span>
          )}
          <span style={{ color: "var(--text-muted)" }}>Projected completion:</span>
          <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
            {forecast.dateLabel}
          </span>
          {forecast.hasOverrun && !forecast.isBlocked && (
            <span style={{ color: "var(--status-blocked)" }}>(overdue)</span>
          )}
        </div>

        {/* Overdue flags */}
        {ganttData.some((d) => d.isOverdue) && (
          <div className="flex gap-5 mt-2">
            {ganttData.filter((d) => d.isOverdue).map((d) => (
              <div
                key={d.phase}
                className="flex items-center gap-1.5 font-mono"
                style={{ fontSize: "11px", color: "var(--status-blocked)" }}
              >
                <span>⚠</span>
                <span>{d.phase} overdue</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
