import PhaseProgress from "./PhaseProgress"
import { trackSections } from "@/data/route"
import { deriveOverallStatus, STATUS, STATUS_COLOUR, STATUS_BG } from "@/lib/status"
import type { TrackSection } from "@/types"

interface KpiBarProps {
  selectedSection: TrackSection | null
}

function countByStatus(sections: TrackSection[]) {
  let complete = 0, inProgress = 0, blocked = 0, notStarted = 0
  for (const s of sections) {
    const o = deriveOverallStatus(s.installation, s.commissioning, s.handover)
    if (o === STATUS.COMPLETE)    complete++
    if (o === STATUS.IN_PROGRESS) inProgress++
    if (o === STATUS.BLOCKED)     blocked++
    if (o === STATUS.NOT_STARTED) notStarted++
  }
  return { complete, inProgress, blocked, notStarted }
}

interface StatCardProps {
  label:        string
  value:        number | string
  colour:       string
  micro?:       string
  microColour?: string
  changeKey?:   string
}

function StatCard({ label, value, colour, micro, microColour, changeKey }: StatCardProps) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background:   "var(--bg-inset)",
        border:       "1px solid var(--border-soft)",
        borderBottom: `3px solid ${colour}`,
        boxShadow:    "0 2px 8px rgba(0,0,0,0.4)",
        transition:   "background 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = "var(--bg-panel)"
        el.style.borderColor = "var(--border-accent)"
        el.style.borderBottomColor = colour
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = "var(--bg-inset)"
        el.style.borderColor = "var(--border-soft)"
        el.style.borderBottomColor = colour
      }}
    >
      <div className="px-4 pt-3 pb-3">
        <div
          className="uppercase mb-1.5"
          style={{
            fontSize:      "10px",
            fontFamily:    "JetBrains Mono, monospace",
            letterSpacing: "0.12em",
            color:         "var(--text-muted)",
          }}
        >
          {label}
        </div>

        {/* Value — remounts on changeKey to trigger fade-in */}
        <div
          key={changeKey}
          className="animate-in fade-in duration-200"
          style={{
            fontSize:   "30px",
            fontFamily: "Barlow Condensed, var(--font-display), sans-serif",
            fontWeight: 700,
            color:      colour,
            lineHeight: 1,
          }}
        >
          {value}
        </div>

        {micro && (
          <div
            className="mt-1"
            style={{
              fontSize:   "10px",
              fontFamily: "JetBrains Mono, monospace",
              color:      microColour ?? "var(--text-muted)",
            }}
          >
            {micro}
          </div>
        )}
      </div>
    </div>
  )
}

export default function KpiBar({ selectedSection }: KpiBarProps) {
  const displaySections = selectedSection ? [selectedSection] : trackSections
  const isFiltered      = selectedSection !== null
  const { complete, inProgress, blocked, notStarted } = countByStatus(displaySections)
  const total = displaySections.length

  const pct = total === 0 ? 0 : Math.round((complete / total) * 100)

  const phasesComplete = isFiltered
    ? [selectedSection.installation, selectedSection.commissioning, selectedSection.handover]
        .filter((p) => p === STATUS.COMPLETE).length
    : 0

  const selectedStatus = isFiltered
    ? deriveOverallStatus(
        selectedSection.installation,
        selectedSection.commissioning,
        selectedSection.handover,
      )
    : null

  // Key that changes whenever selection changes — drives value fade-in
  const changeKey = selectedSection?.id ?? "all"

  return (
    <div
      className="shrink-0"
      style={{
        background:   "var(--bg-card)",
        border:       "1px solid var(--border-strong)",
        borderRadius: "8px",
        overflow:     "hidden",
      }}
    >
      {/* Section context banner — full width */}
      {isFiltered && selectedStatus && (
        <div
          className="flex items-center gap-3 px-6 py-3"
          style={{
            background:   "var(--bg-inset)",
            borderBottom: "1px solid var(--border-soft)",
            borderLeft:   `3px solid ${STATUS_COLOUR[selectedStatus]}`,
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

      {/* Two-column content */}
      <div style={{ display: "flex", alignItems: "stretch" }}>

        {/* Left column — KPI cards (40%) */}
        <div style={{ width: "40%", padding: "20px 24px" }}>
          <div
            style={{
              display:             "grid",
              gridTemplateColumns: "1fr 1fr",
              gap:                 "10px",
            }}
          >
            <StatCard
              label={isFiltered ? "Section" : "Total Sections"}
              value={total}
              colour="var(--text-primary)"
              micro="across this route"
              changeKey={changeKey}
            />
            <StatCard
              label="Complete"
              value={complete}
              colour={STATUS_COLOUR.COMPLETE}
              micro={`all 3 phases done${!isFiltered ? ` · ${pct}%` : ""}`}
              changeKey={changeKey}
            />
            <StatCard
              label="In Progress"
              value={inProgress}
              colour={STATUS_COLOUR.IN_PROGRESS}
              micro="actively under way"
              changeKey={changeKey}
            />
            <StatCard
              label="Blocked"
              value={blocked}
              colour={STATUS_COLOUR.BLOCKED}
              micro="requires intervention"
              microColour={blocked > 0 ? "var(--status-blocked)" : undefined}
              changeKey={changeKey}
            />
            <StatCard
              label="Not Started"
              value={notStarted}
              colour={STATUS_COLOUR.NOT_STARTED}
              micro="not yet mobilised"
              changeKey={changeKey}
            />
            <StatCard
              label={isFiltered ? "Phases Done" : "% Complete"}
              value={isFiltered ? `${phasesComplete}/3` : `${pct}%`}
              colour={STATUS_COLOUR.COMPLETE}
              micro={isFiltered ? "of 3 required phases" : `${pct}% of total`}
              changeKey={changeKey}
            />
          </div>
        </div>

        {/* Vertical divider */}
        <div
          style={{
            width:      "1px",
            background: "var(--border-strong)",
            margin:     "20px 0",
            flexShrink: 0,
          }}
        />

        {/* Right column — Phase breakdown (60%) */}
        <div style={{ flex: 1, padding: "20px 24px" }}>
          <PhaseProgress sections={displaySections} />
        </div>

      </div>
    </div>
  )
}
