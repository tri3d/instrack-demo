import React from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { trackSections } from "@/data/route"
import { deriveOverallStatus, STATUS_COLOUR } from "@/lib/status"
import type { RouteNode } from "@/types"

export type StationNodeData = RouteNode

function StationNode({ data }: NodeProps<StationNodeData>) {
  const adjacent = trackSections.filter(
    (s) => s.from === data.id || s.to === data.id,
  )

  // Derive worst status of all adjacent sections for border colour
  const overallStatuses = adjacent.map((s) =>
    deriveOverallStatus(s.installation, s.commissioning, s.handover),
  )
  const borderColour =
    overallStatuses.includes("BLOCKED")     ? STATUS_COLOUR.BLOCKED     :
    overallStatuses.includes("IN_PROGRESS") ? STATUS_COLOUR.IN_PROGRESS :
    overallStatuses.every((s) => s === "COMPLETE") ? STATUS_COLOUR.COMPLETE :
    STATUS_COLOUR.NOT_STARTED

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative flex flex-col items-center cursor-default select-none">
          {/* Label above */}
          <div
            className="absolute whitespace-nowrap font-semibold"
            style={{
              top: "-20px",
              fontSize: "10px",
              fontFamily: "JetBrains Mono, monospace",
              color: "#cbd5e1",
            }}
          >
            {data.label}
          </div>

          {/* Diamond — consistent dark fill, status-coded border */}
          <div
            className="h-5 w-5 rotate-45 border-2"
            style={{
              background:  "#0d1623",
              borderColor: borderColour,
              boxShadow:   `0 0 8px ${borderColour}60`,
            }}
          />

          {/* km chainage below */}
          <div
            className="absolute whitespace-nowrap"
            style={{
              bottom: "-16px",
              fontSize: "9px",
              fontFamily: "JetBrains Mono, monospace",
              color: "#475569",
            }}
          >
            {data.km.toFixed(1)} km
          </div>

          <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
          <Handle type="target" position={Position.Left}  style={{ opacity: 0 }} />
        </div>
      </TooltipTrigger>

      <TooltipContent
        side="top"
        style={{ background: "#0d1623", border: "1px solid #1f2937", color: "#e2e8f0" }}
        className="font-mono text-xs"
      >
        <div className="font-semibold">{data.label}</div>
        <div style={{ color: "#64748b" }}>
          {data.km.toFixed(1)} km · {data.type}
        </div>
        {adjacent.length > 0 && (
          <div style={{ color: "#64748b" }} className="mt-1">
            Sections: {adjacent.map((s) => s.label).join(", ")}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

export default React.memo(StationNode)
