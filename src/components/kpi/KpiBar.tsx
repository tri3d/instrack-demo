import PhaseProgress from "./PhaseProgress"
import { trackSections } from "@/data/route"
import { deriveOverallStatus, STATUS, STATUS_COLOUR, STATUS_BG } from "@/lib/status"
import type { TrackSection } from "@/types"

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
  bgColour: string
  sub?: string
}

function StatCard({ label, value, colour, bgColour, sub }: StatCardProps) {
  return (
    <div
      className="flex-1 rounded-lg overflow-hidden transition-colors"
      style={{
        background:   "var(--bg-card)",
        border:       "1px solid var(--border-soft)",
        borderBottom: `3px solid ${colour}`,
        boxShadow:    "0 2px 8px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = "var(--bg-card-hover)"
        el.style.borderColor = "var(--border-accent)"
        el.style.borderBottomColor = colour
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = "var(--bg-card)"
        el.style.borderColor = "var(--border-soft)"
        el.style.borderBottomColor = colour
      }}
    >
      <div className="px-4 pt-4 pb-3">
        <div
          className="uppercase mb-2"
          style={{
            fontSize:      "11px",
            fontFamily:    "JetBrains Mono, monospace",
            letterSpacing: "0.12em",
            color:         "var(--text-muted)",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize:   "34px",
            fontFamily: "Barlow Condensed, var(--font-display), sans-serif",
            fontWeight: 700,
            color:      colour,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            className="mt-1"
            style={{
              fontSize:  "11px",
              fontFamily: "JetBrains Mono, monospace",
              color:     "var(--text-muted)",
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

  // Derive the selected section's overall status for the highlight strip
  const selectedStatus = isFiltered
    ? deriveOverallStatus(
        selectedSection.installation,
        selectedSection.commissioning,
        selectedSection.handover,
      )
    : null

  return (
    <div
      className="shrink-0 px-6 py-5"
      style={{
        background:  "var(--bg-base)",
        borderTop:   "1px solid var(--border-strong)",
        borderBottom: "1px solid var(--border-strong)",
      }}
    >
      {/* Section context banner — highlighted with left status strip */}
      {isFiltered && selectedStatus && (
        <div
          className="flex items-center gap-3 rounded mb-4 px-3 py-2"
          style={{
            background:  "var(--bg-card-hover)",
            borderLeft:  `3px solid ${STATUS_COLOUR[selectedStatus]}`,
          }}
        >
          <span
            style={{
              fontSize:      "11px",
              fontFamily:    "JetBrains Mono, monospace",
              letterSpacing: "0.08em",
              color:         STATUS_COLOUR[selectedStatus],
              fontWeight:    600,
            }}
          >
            Section {selectedSection.id}
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {selectedSection.length} · {selectedSection.type}
          </span>
        </div>
      )}

      <div className="flex gap-3">
        <StatCard
          label={isFiltered ? "Section" : "Total Sections"}
          value={total}
          colour="var(--text-primary)"
          bgColour="var(--bg-inset)"
        />
        <StatCard
          label="Complete"
          value={complete}
          colour={STATUS_COLOUR.COMPLETE}
          bgColour={STATUS_BG.COMPLETE}
          sub={!isFiltered ? `${Math.round((complete / total) * 100)}%` : undefined}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          colour={STATUS_COLOUR.IN_PROGRESS}
          bgColour={STATUS_BG.IN_PROGRESS}
        />
        <StatCard
          label="Blocked"
          value={blocked}
          colour={STATUS_COLOUR.BLOCKED}
          bgColour={STATUS_BG.BLOCKED}
        />
      </div>

      <PhaseProgress sections={displaySections} />
    </div>
  )
}
