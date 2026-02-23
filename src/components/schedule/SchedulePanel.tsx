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
import { deriveOverallStatus, STATUS_COLOUR, STATUS_BG, STATUS_LABEL } from "@/lib/status"
import { PROJECT_START, PROJECT_END } from "@/data/route"
import type { TrackSection, PhaseSchedule } from "@/types"

interface SchedulePanelProps {
  section: TrackSection
  onClose: () => void
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
    plannedGap:    plannedStart,
    plannedWidth,
    actualGap:     actualStart,
    actualWidth:   actualWidth ?? 0,
    hasActual:     as_ !== null,
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

// ─── Month tick labels ─────────────────────────────────────────────────────

const MONTH_LABELS: Record<number, string> = {}
;(() => {
  const start = new Date(PROJECT_START)
  const end   = new Date(PROJECT_END)
  let d = new Date(start.getFullYear(), start.getMonth(), 1)
  while (d <= end) {
    const tick = ((d.getTime() - projectStart) / projectSpan) * 100
    MONTH_LABELS[Math.round(tick * 10) / 10] = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  }
})()

function xAxisTick(value: number): string {
  return MONTH_LABELS[Math.round(value * 10) / 10] ?? ""
}

const MONTH_TICKS = Object.keys(MONTH_LABELS).map(Number)

// ─── Component ─────────────────────────────────────────────────────────────

export default function SchedulePanel({ section, onClose }: SchedulePanelProps) {
  const overall = deriveOverallStatus(section.installation, section.commissioning, section.handover)
  const colour  = STATUS_COLOUR[overall]

  const ganttData = [
    buildGanttData("Installation",  section.schedule.installation,  STATUS_COLOUR[section.installation]),
    buildGanttData("Commissioning", section.schedule.commissioning, STATUS_COLOUR[section.commissioning]),
    buildGanttData("Handover",      section.schedule.handover,      STATUS_COLOUR[section.handover]),
  ]

  return (
    <div
      className="shrink-0 animate-in slide-in-from-bottom-2 duration-200"
      style={{
        background: "var(--bg-card)",
        borderTop:  "1px solid var(--border-strong)",
      }}
    >
      {/* Header strip */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          background:    "var(--bg-inset)",
          borderBottom:  "1px solid var(--border-soft)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize:   "15px",
              fontWeight: 700,
              color:      "var(--text-primary)",
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

        <button
          onClick={onClose}
          className="rounded px-3 py-1 transition-colors font-mono"
          style={{
            fontSize:    "11px",
            color:       "var(--text-muted)",
            border:      "1px solid var(--border-soft)",
            background:  "transparent",
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

      {/* Gantt chart area */}
      <div className="px-6 py-4">
        <div
          className="rounded-md overflow-hidden"
          style={{ background: "var(--bg-inset)", padding: "8px 8px 4px" }}
        >
          <ResponsiveContainer width="100%" height={110}>
            <BarChart
              data={ganttData}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 16, left: 90 }}
              barCategoryGap={10}
              barSize={10}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                ticks={MONTH_TICKS}
                tickFormatter={xAxisTick}
                tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fill: "#4a6080" }}
                axisLine={{ stroke: "#2d3f5c" }}
                tickLine={false}
                interval={1}
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

              {/* Today line */}
              {TODAY_TICK >= 0 && TODAY_TICK <= 100 && (
                <ReferenceLine
                  x={TODAY_TICK}
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  label={{
                    value:      "Today",
                    position:   "top",
                    fontSize:   9,
                    fontFamily: "JetBrains Mono, monospace",
                    fill:       "#f59e0b",
                  }}
                />
              )}

              {/* Planned bars — var(--border-accent) hex: #334466 */}
              <Bar dataKey="plannedGap"   stackId="planned" fill="transparent" />
              <Bar dataKey="plannedWidth" stackId="planned" radius={[2, 2, 2, 2]}>
                {ganttData.map((_, i) => <Cell key={i} fill="#334466" />)}
              </Bar>

              {/* Actual bars — status colour */}
              <Bar dataKey="actualGap"    stackId="actual" fill="transparent" />
              <Bar dataKey="actualWidth"  stackId="actual" radius={[2, 2, 2, 2]}>
                {ganttData.map((entry, i) => (
                  <Cell key={i} fill={entry.hasActual ? entry.colour : "transparent"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
