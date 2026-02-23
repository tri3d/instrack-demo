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
        <Topbar />

        {/* Schematic — grows to fill available space */}
        <TrackSchematic
          selectedSectionId={selectedSection?.id ?? null}
          onSelectSection={setSelectedSection}
        />

        {/* KPI bar — fixed height below schematic */}
        <KpiBar selectedSection={selectedSection} />

        {/* Schedule panel — slides in when a section is selected */}
        {selectedSection && (
          <SchedulePanel
            section={selectedSection}
            onClose={() => setSelectedSection(null)}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
