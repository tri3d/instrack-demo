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

const NODE_COLOUR: Record<RouteNode["type"], string> = {
  station: "#94a3b8",
  junction: "#64748b",
  depot: "#7c3aed",
}

function StationNode({ data }: NodeProps<StationNodeData>) {
  const adjacent = trackSections.filter(
    (s) => s.from === data.id || s.to === data.id,
  )
  const overallStatuses = adjacent.map((s) =>
    deriveOverallStatus(s.installation, s.commissioning, s.handover),
  )
  const hasBlocked = overallStatuses.includes("BLOCKED")
  const hasInProgress = overallStatuses.includes("IN_PROGRESS")
  const borderColour = hasBlocked
    ? STATUS_COLOUR.BLOCKED
    : hasInProgress
      ? STATUS_COLOUR.IN_PROGRESS
      : STATUS_COLOUR.COMPLETE

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative flex flex-col items-center cursor-default select-none">
          {/* Diamond shape */}
          <div
            className="h-5 w-5 rotate-45 border-2"
            style={{
              background: NODE_COLOUR[data.type],
              borderColor: borderColour,
              boxShadow: `0 0 6px ${borderColour}55`,
            }}
          />
          {/* Label above (rendered outside diamond via absolute positioning) */}
          <div
            className="absolute -top-5 text-[10px] font-mono whitespace-nowrap font-semibold"
            style={{ color: "#cbd5e1" }}
          >
            {data.label}
          </div>
          {/* km below */}
          <div
            className="absolute -bottom-4 text-[9px] font-mono"
            style={{ color: "#475569" }}
          >
            {data.km.toFixed(1)} km
          </div>
          <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
          <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="font-mono text-xs"
        style={{ background: "#0d1623", border: "1px solid #1f2937", color: "#e2e8f0" }}
      >
        <div className="font-semibold">{data.label}</div>
        <div style={{ color: "#64748b" }}>{data.km.toFixed(1)} km · {data.type}</div>
        <div style={{ color: "#64748b" }} className="mt-1">
          Sections: {adjacent.map((s) => s.label).join(", ")}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export default React.memo(StationNode)
