import PhaseProgress from "./PhaseProgress"
import { trackSections } from "@/data/route"
import { deriveOverallStatus, STATUS } from "@/lib/status"
import type { TrackSection } from "@/types"

// Colours per spec
const CARD_COLOURS = {
  total:      "#e5e7eb",
  complete:   "#34d399",
  inProgress: "#fbbf24",
  blocked:    "#f87171",
} as const

interface KpiBarProps {
  selectedSection: TrackSection | null
}

function countByStatus(sections: TrackSection[]) {
  let complete = 0, inProgress = 0, blocked = 0
  for (const s of sections) {
    const o = deriveOverallStatus(s.installation, s.commissioning, s.handover)
    if (o === STATUS.COMPLETE)    complete++
    if (o === STATUS.IN_PROGRESS) inProgress++
    if (o === STATUS.BLOCKED)     blocked++
  }
  return { complete, inProgress, blocked }
}

interface StatCardProps {
  label: string
  value: number | string
  colour: string
  sub?: string
}

function StatCard({ label, value, colour, sub }: StatCardProps) {
  return (
    <div
      className="flex-1 rounded-lg overflow-hidden"
      style={{
        background:   "#0d1520",
        border:       "1px solid #1f2937",
        borderBottom: `3px solid ${colour}`,
      }}
    >
      <div className="px-4 pt-4 pb-3">
        <div
          className="uppercase tracking-widest mb-2"
          style={{
            fontSize: "9px",
            fontFamily: "JetBrains Mono, monospace",
            color: "#6b7280",
            letterSpacing: "0.12em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "32px",
            fontFamily: "Barlow Condensed, var(--font-display), sans-serif",
            fontWeight: 700,
            color: colour,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            className="mt-1"
            style={{
              fontSize: "10px",
              fontFamily: "JetBrains Mono, monospace",
              color: "#374151",
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

export default function KpiBar({ selectedSection }: KpiBarProps) {
  const displaySections = selectedSection ? [selectedSection] : trackSections
  const isFiltered      = selectedSection !== null
  const { complete, inProgress, blocked } = countByStatus(displaySections)
  const total = displaySections.length

  return (
    <div
      className="shrink-0 px-6 py-4"
      style={{ background: "#080f18", borderColor: "#1f2937" }}
    >
      {/* Section context label when filtered */}
      {isFiltered && (
        <div
          className="uppercase tracking-widest mb-3"
          style={{
            fontSize: "10px",
            fontFamily: "JetBrains Mono, monospace",
            color: "#d97706",
            letterSpacing: "0.12em",
          }}
        >
          Section {selectedSection.id} · {selectedSection.length} · {selectedSection.type}
        </div>
      )}

      <div className="flex gap-3">
        <StatCard
          label={isFiltered ? "Section" : "Total Sections"}
          value={total}
          colour={CARD_COLOURS.total}
        />
        <StatCard
          label="Complete"
          value={complete}
          colour={CARD_COLOURS.complete}
          sub={!isFiltered ? `${Math.round((complete / total) * 100)}%` : undefined}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          colour={CARD_COLOURS.inProgress}
        />
        <StatCard
          label="Blocked"
          value={blocked}
          colour={CARD_COLOURS.blocked}
        />
      </div>

      <PhaseProgress sections={displaySections} />
    </div>
  )
}
