import { trackSections } from "@/data/route"
import { STATUS, STATUS_COLOUR, STATUS_LABEL } from "@/lib/status"
import type { Status } from "@/lib/status"

function computePhaseCounts() {
  let complete = 0, inProgress = 0, blocked = 0, notStarted = 0
  for (const s of trackSections) {
    const phases: Status[] = [s.installation, s.commissioning, s.handover]
    for (const p of phases) {
      if (p === STATUS.COMPLETE)    complete++
      if (p === STATUS.IN_PROGRESS) inProgress++
      if (p === STATUS.BLOCKED)     blocked++
      if (p === STATUS.NOT_STARTED) notStarted++
    }
  }
  return { complete, inProgress, blocked, notStarted }
}

const SEGMENT_ORDER: Status[] = [
  STATUS.COMPLETE,
  STATUS.IN_PROGRESS,
  STATUS.BLOCKED,
  STATUS.NOT_STARTED,
]

export default function ProjectHealthBar() {
  const counts = computePhaseCounts()
  const total  = trackSections.length * 3   // 5 × 3 = 15

  return (
    <div
      className="shrink-0 flex items-center gap-4 px-6"
      style={{
        height:       "40px",
        background:   "var(--bg-panel)",
        border:       "1px solid var(--border-strong)",
        borderRadius: "8px",
      }}
    >
      {/* Left label */}
      <span
        style={{
          fontSize:      "10px",
          fontFamily:    "JetBrains Mono, monospace",
          letterSpacing: "0.12em",
          color:         "var(--text-muted)",
          whiteSpace:    "nowrap",
          flexShrink:    0,
        }}
      >
        PROJECT PROGRESS
      </span>

      {/* Segmented progress bar */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          height:       "8px",
          borderRadius: "4px",
          background:   "var(--bg-inset)",
          display:      "flex",
        }}
        title={SEGMENT_ORDER.map(s => `${STATUS_LABEL[s]}: ${counts[s as keyof typeof counts]}`).join(" · ")}
      >
        {SEGMENT_ORDER.map((status) => {
          const count = counts[status as keyof typeof counts]
          if (count === 0) return null
          return (
            <div
              key={status}
              style={{
                width:      `${(count / total) * 100}%`,
                background: STATUS_COLOUR[status],
                transition: "width 0.6s ease-out",
                flexShrink: 0,
              }}
            />
          )
        })}
      </div>

      {/* Right label */}
      <span
        style={{
          fontSize:   "11px",
          fontFamily: "JetBrains Mono, monospace",
          color:      "var(--text-secondary)",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {counts.complete} / {total} phases complete
      </span>
    </div>
  )
}
