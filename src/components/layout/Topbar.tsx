import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { trackSections } from "@/data/route"
import { STATUS, STATUS_COLOUR, STATUS_BG, STATUS_LABEL, deriveOverallStatus, ALL_STATUSES } from "@/lib/status"
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
    NOT_STARTED: 0, IN_PROGRESS: 0, COMPLETE: 0, BLOCKED: 0,
  }
  for (const s of trackSections) {
    counts[deriveOverallStatus(s.installation, s.commissioning, s.handover)]++
  }
  return counts
}

export default function Topbar() {
  const counts = statusCounts()
  const [exportHint, setExportHint] = useState(false)

  const handleExport = () => {
    setExportHint(true)
    setTimeout(() => setExportHint(false), 2000)
  }

  return (
    <header
      className="flex h-13 items-center gap-4 px-6 shrink-0"
      style={{
        height:       "52px",
        background:   "var(--bg-panel)",
        border:       "1px solid var(--border-strong)",
        borderRadius: "8px",
      }}
    >
      {/* Wordmark */}
      <div
        className="flex items-center select-none"
        style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em" }}
      >
        <span style={{ color: "var(--text-secondary)" }}>ins</span>
        <span style={{ color: "var(--accent)" }}>track</span>
      </div>

      <Separator
        orientation="vertical"
        className="h-5"
        style={{ background: "var(--border-strong)" }}
      />

      {/* Project name */}
      <div
        className="flex-1 text-center uppercase"
        style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "13px",
          fontWeight:    600,
          letterSpacing: "0.15em",
          color:         "var(--text-secondary)",
        }}
      >
        Millfield — Apex Terminal Line
      </div>

      {/* Status legend */}
      <div className="flex items-center gap-4">
        {ALL_STATUSES.map((status) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: STATUS_COLOUR[status] }}
            />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {STATUS_LABEL[status]}
            </span>
            {counts[status] > 0 && (
              <Badge
                variant="outline"
                className="h-4 px-1.5"
                style={{
                  fontSize:    "10px",
                  fontFamily:  "var(--font-mono)",
                  borderColor: STATUS_COLOUR[status] + "60",
                  color:       STATUS_COLOUR[status],
                  background:  STATUS_BG[status],
                }}
              >
                {counts[status]}
              </Badge>
            )}
          </div>
        ))}
      </div>

      <Separator
        orientation="vertical"
        className="h-5"
        style={{ background: "var(--border-strong)" }}
      />

      {/* Export button */}
      <div style={{ position: "relative" }}>
        <button
          onClick={handleExport}
          className="font-mono"
          style={{
            fontSize:     "11px",
            color:        "var(--text-secondary)",
            border:       "1px solid var(--border-strong)",
            background:   "transparent",
            padding:      "3px 10px",
            borderRadius: "4px",
            cursor:       "pointer",
            transition:   "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = "var(--text-primary)"
            el.style.borderColor = "var(--border-accent)"
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = "var(--text-secondary)"
            el.style.borderColor = "var(--border-strong)"
          }}
        >
          ↓ Export
        </button>

        {exportHint && (
          <div
            className="animate-in fade-in duration-150 font-mono"
            style={{
              position:    "absolute",
              top:         "-32px",
              left:        "50%",
              transform:   "translateX(-50%)",
              background:  "var(--bg-card)",
              border:      "1px solid var(--border-strong)",
              borderRadius:"4px",
              padding:     "4px 10px",
              fontSize:    "11px",
              color:       "var(--text-secondary)",
              whiteSpace:  "nowrap",
              zIndex:      50,
            }}
          >
            Export coming soon
          </div>
        )}
      </div>

      <Separator
        orientation="vertical"
        className="h-5"
        style={{ background: "var(--border-strong)" }}
      />

      {/* Timestamp */}
      <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
        Updated {LAST_UPDATED}
      </div>
    </header>
  )
}
