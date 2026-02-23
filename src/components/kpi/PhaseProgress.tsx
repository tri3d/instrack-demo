import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts"
import { STATUS, STATUS_COLOUR, STATUS_LABEL } from "@/lib/status"
import type { TrackSection } from "@/types"

interface PhaseProgressProps {
  sections: TrackSection[]
}

const PHASES = [
  { key: "installation",  label: "Installation"  },
  { key: "commissioning", label: "Commissioning" },
  { key: "handover",      label: "Handover"      },
] as const

type PhaseKey = (typeof PHASES)[number]["key"]

const STATUS_STACK_ORDER = [
  STATUS.COMPLETE,
  STATUS.IN_PROGRESS,
  STATUS.BLOCKED,
  STATUS.NOT_STARTED,
] as const

function buildChartData(sections: TrackSection[]) {
  return PHASES.map(({ key, label }) => {
    const counts: Record<string, number> = {
      COMPLETE: 0,
      IN_PROGRESS: 0,
      BLOCKED: 0,
      NOT_STARTED: 0,
    }
    for (const s of sections) {
      counts[s[key as PhaseKey]]++
    }
    return { phase: label, total: sections.length, ...counts }
  })
}

export default function PhaseProgress({ sections }: PhaseProgressProps) {
  const data = buildChartData(sections)
  const total = sections.length

  if (total === 0) return null

  return (
    <div className="mt-3 px-1">
      <div
        className="text-[11px] font-mono mb-2 uppercase tracking-wider"
        style={{ color: "#475569" }}
      >
        Phase Breakdown
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 60, bottom: 0, left: 80 }}
          barSize={10}
        >
          <XAxis
            type="number"
            domain={[0, total]}
            hide
          />
          <YAxis
            type="category"
            dataKey="phase"
            tick={{
              fontSize: 10,
              fontFamily: "JetBrains Mono, monospace",
              fill: "#64748b",
            }}
            width={72}
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
          {STATUS_STACK_ORDER.map((status) => (
            <Bar
              key={status}
              dataKey={status}
              stackId="a"
              fill={STATUS_COLOUR[status]}
              radius={0}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={STATUS_COLOUR[status]} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 mt-1 justify-end">
        {STATUS_STACK_ORDER.map((s) => (
          <div key={s} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: STATUS_COLOUR[s] }}
            />
            <span className="text-[10px] font-mono" style={{ color: "#475569" }}>
              {STATUS_LABEL[s]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
