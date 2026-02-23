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
import { deriveOverallStatus, STATUS_COLOUR, STATUS_LABEL } from "@/lib/status"
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
  const ps = toMs(sched.plannedStart)
  const pe = toMs(sched.plannedEnd)
  const as_ = sched.actualStart ? toMs(sched.actualStart) : null
  const ae  = sched.actualEnd   ? toMs(sched.actualEnd)   : null

  const plannedStart = msToTick(ps)
  const plannedWidth = msToTick(pe) - plannedStart

  const actualStart = as_ ? msToTick(as_) : null
  const actualWidth = as_
    ? (ae ? msToTick(ae) : msToTick(Date.now() > pe ? pe : Date.now())) - msToTick(as_)
    : null

  const isOverdue = ae === null && as_ !== null && Date.now() > pe

  return {
    phase: label,
    plannedGap:   plannedStart,
    plannedWidth,
    actualGap:    actualStart,
    actualWidth:  actualWidth ?? 0,
    hasActual:    as_ !== null,
    isOverdue,
    colour,
    plannedEndTick: msToTick(pe),
    tooltip: {
      plannedStart: sched.plannedStart,
      plannedEnd:   sched.plannedEnd,
      actualStart:  sched.actualStart,
      actualEnd:    sched.actualEnd,
    },
  }
}

const TODAY_TICK = msToTick(Date.now())

// ─── Custom Tooltip ────────────────────────────────────────────────────────

function GanttTooltip({ active, payload }: { active?: boolean; payload?: unknown[] }) {
  if (!active || !payload?.length) return null
  const entry = payload[0] as { payload: ReturnType<typeof buildGanttData> }
  const d = entry.payload
  return (
    <div
      className="rounded border p-2 text-[11px] font-mono"
      style={{ background: "#0d1623", borderColor: "#1f2937", color: "#e2e8f0" }}
    >
      <div className="font-semibold mb-1">{d.phase}</div>
      <div style={{ color: "#64748b" }}>Planned: {d.tooltip.plannedStart} → {d.tooltip.plannedEnd}</div>
      {d.tooltip.actualStart && (
        <div style={{ color: d.colour }}>
          Actual: {d.tooltip.actualStart} → {d.tooltip.actualEnd ?? "ongoing"}
        </div>
      )}
      {d.isOverdue && (
        <div style={{ color: STATUS_COLOUR.BLOCKED }} className="mt-1 font-semibold">
          ⚠ Overdue
        </div>
      )}
    </div>
  )
}

// ─── Tick formatter for the X axis ────────────────────────────────────────

const MONTH_LABELS: Record<number, string> = {}
;(() => {
  const start = new Date(PROJECT_START)
  const end   = new Date(PROJECT_END)
  let d = new Date(start.getFullYear(), start.getMonth(), 1)
  while (d <= end) {
    const ms = d.getTime()
    const tick = ((ms - projectStart) / projectSpan) * 100
    MONTH_LABELS[Math.round(tick * 10) / 10] = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  }
})()

function xAxisTick(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return MONTH_LABELS[rounded] ?? ""
}

const MONTH_TICKS = Object.keys(MONTH_LABELS).map(Number)

// ─── Component ─────────────────────────────────────────────────────────────

export default function SchedulePanel({ section, onClose }: SchedulePanelProps) {
  const overall  = deriveOverallStatus(section.installation, section.commissioning, section.handover)
  const colour   = STATUS_COLOUR[overall]

  const ganttData = [
    buildGanttData("Installation",  section.schedule.installation,  STATUS_COLOUR[section.installation]),
    buildGanttData("Commissioning", section.schedule.commissioning, STATUS_COLOUR[section.commissioning]),
    buildGanttData("Handover",      section.schedule.handover,      STATUS_COLOUR[section.handover]),
  ]

  return (
    <div
      className="border-t shrink-0 px-6 py-4 animate-in slide-in-from-bottom-2 duration-200"
      style={{ background: "#080f18", borderColor: "#1f2937" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className="text-base font-mono font-semibold"
            style={{ color: "#e2e8f0", fontFamily: "var(--font-display)", fontSize: 16 }}
          >
            Section {section.id}
          </span>
          <span className="text-sm font-mono" style={{ color: "#64748b" }}>
            {section.length} · {section.type}
          </span>
          <Badge
            variant="outline"
            className="text-[11px] font-mono px-2"
            style={{ borderColor: colour, color: colour, background: "transparent" }}
          >
            {STATUS_LABEL[overall]}
          </Badge>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-mono px-2 py-1 rounded border"
          style={{
            color: "#64748b",
            borderColor: "#1f2937",
            background: "#0d1623",
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* Gantt */}
      <ResponsiveContainer width="100%" height={110}>
        <BarChart
          data={ganttData}
          layout="vertical"
          margin={{ top: 0, right: 20, bottom: 16, left: 90 }}
          barCategoryGap={8}
          barSize={8}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            ticks={MONTH_TICKS}
            tickFormatter={xAxisTick}
            tick={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace", fill: "#374151" }}
            axisLine={{ stroke: "#1f2937" }}
            tickLine={false}
            interval={1}
          />
          <YAxis
            type="category"
            dataKey="phase"
            tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fill: "#64748b" }}
            width={82}
            axisLine={false}
            tickLine={false}
          />
          <ReTooltip content={<GanttTooltip />} cursor={false} />

          {/* Today line */}
          {TODAY_TICK >= 0 && TODAY_TICK <= 100 && (
            <ReferenceLine
              x={TODAY_TICK}
              stroke="#d97706"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              label={{
                value: "Today",
                position: "top",
                fontSize: 9,
                fontFamily: "JetBrains Mono, monospace",
                fill: "#d97706",
              }}
            />
          )}

          {/* Planned bar (background muted) */}
          <Bar dataKey="plannedGap" stackId="planned" fill="transparent" />
          <Bar dataKey="plannedWidth" stackId="planned" radius={[2, 2, 2, 2]}>
            {ganttData.map((entry, i) => (
              <Cell key={i} fill="#1f2937" />
            ))}
          </Bar>

          {/* Actual bar (status colour, overlaid row) */}
          <Bar dataKey="actualGap" stackId="actual" fill="transparent" />
          <Bar dataKey="actualWidth" stackId="actual" radius={[2, 2, 2, 2]}>
            {ganttData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.hasActual ? entry.colour : "transparent"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Overdue flags */}
      {ganttData.some((d) => d.isOverdue) && (
        <div className="flex gap-4 mt-1">
          {ganttData.filter((d) => d.isOverdue).map((d) => (
            <div
              key={d.phase}
              className="flex items-center gap-1 text-[11px] font-mono"
              style={{ color: STATUS_COLOUR.BLOCKED }}
            >
              <span>⚠</span>
              <span>{d.phase} overdue</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
