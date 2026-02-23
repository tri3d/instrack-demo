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
        className="flex flex-col h-screen overflow-hidden"
        style={{ background: "var(--bg-base)", fontFamily: "var(--font-mono)" }}
      >
        {/* Topbar */}
        <Topbar />

        {/* Track schematic — fixed 280px */}
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
            className="shrink-0 flex items-center justify-center"
            style={{
              height: "56px",
              background: "var(--bg-card)",
              borderTop: "1px solid var(--border-strong)",
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
