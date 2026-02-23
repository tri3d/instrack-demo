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
          {/* Station label above */}
          <div
            className="absolute whitespace-nowrap font-semibold"
            style={{
              top: "-22px",
              fontSize: "11px",
              fontFamily: "JetBrains Mono, monospace",
              color: "var(--text-primary)",
            }}
          >
            {data.label}
          </div>

          {/* Diamond — bg-panel fill, status-coded border */}
          <div
            className="h-5 w-5 rotate-45 border-2"
            style={{
              background:  "var(--bg-panel)",
              borderColor: borderColour,
              boxShadow:   `0 0 10px ${borderColour}50`,
            }}
          />

          {/* km chainage below */}
          <div
            className="absolute whitespace-nowrap"
            style={{
              bottom: "-18px",
              fontSize: "10px",
              fontFamily: "JetBrains Mono, monospace",
              color: "var(--text-muted)",
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
        className="font-mono"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-strong)",
          color: "var(--text-primary)",
          fontSize: "12px",
        }}
      >
        <div className="font-semibold">{data.label}</div>
        <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
          {data.km.toFixed(1)} km · {data.type}
        </div>
        {adjacent.length > 0 && (
          <div style={{ color: "var(--text-muted)", marginTop: "4px" }}>
            Sections: {adjacent.map((s) => s.label).join(", ")}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

export default React.memo(StationNode)
