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
        style={{ background: "#060d14", fontFamily: "var(--font-mono)" }}
      >
        {/* Topbar — ~52px */}
        <Topbar />

        {/* Track schematic — fixed 280px */}
        <TrackSchematic
          selectedSectionId={selectedSection?.id ?? null}
          onSelectSection={setSelectedSection}
        />

        {/* KPI cards + phase breakdown */}
        <KpiBar selectedSection={selectedSection} />

        {/* Schedule area — placeholder or Gantt panel */}
        {selectedSection ? (
          <SchedulePanel
            section={selectedSection}
            onClose={() => setSelectedSection(null)}
          />
        ) : (
          <div
            className="shrink-0 flex items-center justify-center border-t"
            style={{
              height: "64px",
              background: "#080f18",
              borderColor: "#1f2937",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontFamily: "JetBrains Mono, monospace",
                color: "#2d3f52",
              }}
            >
              ↑ Click a track section to view its schedule
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
