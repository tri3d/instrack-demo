import { useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import Topbar from "@/components/layout/Topbar"
import TrackSchematic from "@/components/schematic/TrackSchematic"
import KpiBar from "@/components/kpi/KpiBar"
import SchedulePanel from "@/components/schedule/SchedulePanel"
import type { TrackSection } from "@/types"

export default function App() {
  const [selectedSection, setSelectedSection] = useState<TrackSection | null>(null)

  return (
    <TooltipProvider delayDuration={300}>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-base)",
          fontFamily: "var(--font-mono)",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          gap: "20px",
        }}
      >
        {/* Topbar */}
        <Topbar />

        {/* Track schematic */}
        <TrackSchematic
          selectedSectionId={selectedSection?.id ?? null}
          onSelectSection={setSelectedSection}
        />

        {/* KPI cards + phase breakdown */}
        <KpiBar selectedSection={selectedSection} />

        {/* Schedule area */}
        {selectedSection ? (
          <SchedulePanel
            section={selectedSection}
            onClose={() => setSelectedSection(null)}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "56px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-strong)",
              borderRadius: "8px",
            }}
          >
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              ↑ Click a track section to view its schedule
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
