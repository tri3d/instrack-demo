import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts"
import { STATUS, STATUS_LABEL } from "@/lib/status"
import type { TrackSection } from "@/types"

// Mapped to new navy theme status tokens
const PHASE_COLOURS = {
  [STATUS.COMPLETE]:    "var(--status-complete)",
  [STATUS.IN_PROGRESS]: "var(--status-progress)",
  [STATUS.BLOCKED]:     "var(--status-blocked)",
  [STATUS.NOT_STARTED]: "var(--status-none)",
} as const

// Recharts needs resolved hex values for SVG fill — CSS vars don't work in SVG attributes
const PHASE_COLOURS_HEX = {
  [STATUS.COMPLETE]:    "#22c55e",
  [STATUS.IN_PROGRESS]: "#f59e0b",
  [STATUS.BLOCKED]:     "#ef4444",
  [STATUS.NOT_STARTED]: "#4a6080",
} as const

interface PhaseProgressProps {
  sections: TrackSection[]
}

const PHASES = [
  { key: "installation",  label: "Installation"  },
  { key: "commissioning", label: "Commissioning" },
  { key: "handover",      label: "Handover"      },
] as const

type PhaseKey = (typeof PHASES)[number]["key"]

// Stack order left→right: Complete → In Progress → Blocked → Not Started
const STACK_ORDER = [
  STATUS.COMPLETE,
  STATUS.IN_PROGRESS,
  STATUS.BLOCKED,
  STATUS.NOT_STARTED,
] as const

function buildChartData(sections: TrackSection[]) {
  return PHASES.map(({ key, label }) => {
    const counts: Record<string, number> = {
      COMPLETE: 0, IN_PROGRESS: 0, BLOCKED: 0, NOT_STARTED: 0,
    }
    for (const s of sections) {
      counts[s[key as PhaseKey]]++
    }
    return { phase: label, total: sections.length, ...counts }
  })
}

export default function PhaseProgress({ sections }: PhaseProgressProps) {
  const data  = buildChartData(sections)
  const total = sections.length

  if (total === 0) return null

  return (
    <div>
      <div
        className="uppercase mb-3"
        style={{
          fontSize:      "11px",
          fontFamily:    "JetBrains Mono, monospace",
          letterSpacing: "0.12em",
          color:         "var(--text-muted)",
        }}
      >
        Phase Breakdown
      </div>

      {/* Chart area with inset background */}
      <div
        className="rounded-md overflow-hidden"
        style={{ background: "var(--bg-inset)", padding: "8px 4px 4px" }}
      >
        <ResponsiveContainer width="100%" height={72}>
          <BarChart
            key={sections.map((s) => s.id).join(",")}
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 8, bottom: 0, left: 88 }}
            barSize={16}
            barCategoryGap="30%"
          >
            <XAxis type="number" domain={[0, total]} hide />
            <YAxis
              type="category"
              dataKey="phase"
              tick={{
                fontSize:   11,
                fontFamily: "JetBrains Mono, monospace",
                fill:       "#8fa3be",  // --text-secondary
              }}
              width={80}
              axisLine={false}
              tickLine={false}
            />
            <ReTooltip
              cursor={false}
              contentStyle={{
                background:   "#1a2236",
                border:       "1px solid #2d3f5c",
                borderRadius: 4,
                fontSize:     11,
                fontFamily:   "JetBrains Mono, monospace",
                color:        "#e8edf5",
              }}
              formatter={(value: number, name: string) => [
                `${value} / ${total}`,
                STATUS_LABEL[name as keyof typeof STATUS_LABEL] ?? name,
              ]}
            />
            {STACK_ORDER.map((status) => (
              <Bar
                key={status}
                dataKey={status}
                stackId="phases"
                fill={PHASE_COLOURS_HEX[status]}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
                radius={
                status === STATUS.COMPLETE    ? [2, 0, 0, 2] :
                status === STATUS.NOT_STARTED ? [0, 2, 2, 0] : 0
              }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-5 mt-2">
        {STACK_ORDER.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: PHASE_COLOURS_HEX[s] }}
            />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {STATUS_LABEL[s]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
