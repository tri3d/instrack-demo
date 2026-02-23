import { Card, CardContent } from "@/components/ui/card"
import PhaseProgress from "./PhaseProgress"
import { trackSections } from "@/data/route"
import { deriveOverallStatus, STATUS, STATUS_COLOUR } from "@/lib/status"
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
  label: string
  value: number
  colour: string
  sub?: string
}

function StatCard({ label, value, colour, sub }: StatCardProps) {
  return (
    <Card
      className="flex-1 border"
      style={{ background: "#0d1623", borderColor: "#1f2937" }}
    >
      <CardContent className="p-4">
        <div
          className="text-[10px] font-mono uppercase tracking-widest mb-1"
          style={{ color: "#475569" }}
        >
          {label}
        </div>
        <div
          className="text-3xl font-mono font-semibold"
          style={{ color: colour, fontFamily: "var(--font-display)", lineHeight: 1 }}
        >
          {value}
        </div>
        {sub && (
          <div className="text-[10px] font-mono mt-1" style={{ color: "#374151" }}>
            {sub}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function KpiBar({ selectedSection }: KpiBarProps) {
  const displaySections = selectedSection ? [selectedSection] : trackSections
  const isFiltered = selectedSection !== null
  const { complete, inProgress, blocked } = countByStatus(displaySections)
  const total = displaySections.length

  return (
    <div
      className="border-t px-6 py-4 shrink-0"
      style={{ background: "#080f18", borderColor: "#1f2937" }}
    >
      {/* Section context label */}
      {isFiltered && (
        <div
          className="text-[10px] font-mono uppercase tracking-widest mb-3"
          style={{ color: "#d97706" }}
        >
          Section {selectedSection.id} · {selectedSection.label} · {selectedSection.length} · {selectedSection.type}
        </div>
      )}

      <div className="flex gap-3">
        <StatCard
          label={isFiltered ? "Section" : "Total Sections"}
          value={total}
          colour="#94a3b8"
        />
        <StatCard
          label="Complete"
          value={complete}
          colour={STATUS_COLOUR.COMPLETE}
          sub={isFiltered ? undefined : `${Math.round((complete / total) * 100)}%`}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          colour={STATUS_COLOUR.IN_PROGRESS}
        />
        <StatCard
          label="Blocked"
          value={blocked}
          colour={STATUS_COLOUR.BLOCKED}
        />
      </div>

      <PhaseProgress sections={displaySections} />
    </div>
  )
}
