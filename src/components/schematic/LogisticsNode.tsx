import React from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { LogisticsPoint } from "@/types"

export type LogisticsNodeData = LogisticsPoint & { trackY: number }

const ICON: Record<LogisticsPoint["type"], string> = {
  railhead:     "▲",
  road_access:  "⊕",
  power_source: "⚡",
}

const TYPE_LABEL: Record<LogisticsPoint["type"], string> = {
  railhead:     "Railhead",
  road_access:  "Road Access",
  power_source: "Power Source",
}

function LogisticsNode({ data }: NodeProps<LogisticsNodeData>) {
  const connectorHeight = data.trackY ?? 60

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative flex flex-col items-center cursor-default select-none">
          {/* Dashed connector to track */}
          <svg
            className="absolute top-full left-1/2 -translate-x-1/2 pointer-events-none"
            width="2"
            height={connectorHeight}
            style={{ overflow: "visible" }}
          >
            <line
              x1="1" y1="0" x2="1" y2={connectorHeight}
              stroke="var(--accent-amber)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.35"
            />
          </svg>

          {/* Node pill */}
          <div
            className="flex items-center gap-1.5 rounded px-2 py-1 border"
            style={{
              background:  "var(--bg-card)",
              borderColor: "var(--border-strong)",
              color:       "var(--accent-amber)",
              fontSize:    "11px",
              fontFamily:  "JetBrains Mono, monospace",
            }}
          >
            <span style={{ fontSize: "12px", lineHeight: 1 }}>{ICON[data.type]}</span>
            <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{data.label}</span>
          </div>

          <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
        </div>
      </TooltipTrigger>

      <TooltipContent
        side="top"
        className="font-mono max-w-52"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-strong)",
          color: "var(--text-primary)",
          fontSize: "12px",
        }}
      >
        <div className="font-semibold">{data.label}</div>
        <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
          {TYPE_LABEL[data.type]} · {data.km.toFixed(1)} km
        </div>
        <div style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "11px", lineHeight: 1.5 }}>
          {data.notes}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export default React.memo(LogisticsNode)
