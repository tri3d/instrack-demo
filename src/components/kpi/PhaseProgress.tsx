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

// Phase breakdown colours per spec
const PHASE_COLOURS = {
  [STATUS.COMPLETE]:    "#059669",
  [STATUS.IN_PROGRESS]: "#d97706",
  [STATUS.BLOCKED]:     "#dc2626",
  [STATUS.NOT_STARTED]: "#374151",
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

// Stack order — render NOT_STARTED first (back) so status colours sit on top
const STACK_ORDER = [
  STATUS.NOT_STARTED,
  STATUS.BLOCKED,
  STATUS.IN_PROGRESS,
  STATUS.COMPLETE,
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
    <div className="mt-4">
      <div
        className="uppercase tracking-widest mb-3"
        style={{
          fontSize: "9px",
          fontFamily: "JetBrains Mono, monospace",
          color: "#4b5563",
          letterSpacing: "0.12em",
        }}
      >
        Phase Breakdown
      </div>

      <ResponsiveContainer width="100%" height={72}>
        <BarChart
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
              fontSize: 10,
              fontFamily: "JetBrains Mono, monospace",
              fill: "#4b5563",
            }}
            width={80}
            axisLine={false}
            tickLine={false}
          />
          <ReTooltip
            cursor={false}
            contentStyle={{
              background: "#0d1623",
              border: "1px solid #1f2937",
              borderRadius: 4,
              fontSize: 11,
              fontFamily: "JetBrains Mono, monospace",
              color: "#e2e8f0",
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
              fill={PHASE_COLOURS[status]}
              isAnimationActive={false}
              radius={status === STATUS.COMPLETE ? [0, 2, 2, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Inline legend */}
      <div className="flex gap-4 mt-2">
        {STACK_ORDER.slice().reverse().map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: PHASE_COLOURS[s] }}
            />
            <span
              style={{
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
                color: "#4b5563",
              }}
            >
              {STATUS_LABEL[s]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
