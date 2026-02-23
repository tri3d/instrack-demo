import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { trackSections } from "@/data/route"
import { STATUS, STATUS_COLOUR, STATUS_LABEL, deriveOverallStatus, ALL_STATUSES } from "@/lib/status"
import type { Status } from "@/lib/status"

const LAST_UPDATED = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function statusCounts(): Record<Status, number> {
  const counts: Record<Status, number> = {
    NOT_STARTED: 0,
    IN_PROGRESS: 0,
    COMPLETE:    0,
    BLOCKED:     0,
  }
  for (const s of trackSections) {
    const overall = deriveOverallStatus(s.installation, s.commissioning, s.handover)
    counts[overall]++
  }
  return counts
}

export default function Topbar() {
  const counts = statusCounts()

  return (
    <header
      className="flex h-14 items-center gap-4 border-b px-6 shrink-0"
      style={{ background: "#080f18", borderColor: "#1f2937" }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-0 font-mono text-lg font-semibold tracking-tight select-none">
        <span style={{ color: "#e2e8f0" }}>ins</span>
        <span style={{ color: "#d97706" }}>track</span>
      </div>

      <Separator orientation="vertical" className="h-5 opacity-30" />

      {/* Project name */}
      <div
        className="flex-1 text-center text-sm font-semibold tracking-widest uppercase"
        style={{ fontFamily: "var(--font-display)", color: "#94a3b8", letterSpacing: "0.15em" }}
      >
        Millfield — Apex Terminal Line
      </div>

      {/* Status legend */}
      <div className="flex items-center gap-3">
        {ALL_STATUSES.map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: STATUS_COLOUR[status] }}
            />
            <span
              className="text-xs font-mono"
              style={{ color: "#64748b" }}
            >
              {STATUS_LABEL[status]}
            </span>
            {counts[status] > 0 && (
              <Badge
                variant="outline"
                className="h-4 px-1 text-[10px] font-mono"
                style={{
                  borderColor: STATUS_COLOUR[status],
                  color: STATUS_COLOUR[status],
                  background: "transparent",
                }}
              >
                {counts[status]}
              </Badge>
            )}
          </div>
        ))}
      </div>

      <Separator orientation="vertical" className="h-5 opacity-30" />

      {/* Timestamp */}
      <div className="text-[11px] font-mono whitespace-nowrap" style={{ color: "#475569" }}>
        Updated {LAST_UPDATED}
      </div>
    </header>
  )
}
