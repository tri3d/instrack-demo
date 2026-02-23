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
          {/* Connector line down to track */}
          <svg
            className="absolute top-full left-1/2 -translate-x-1/2 pointer-events-none"
            width="2"
            height={connectorHeight}
            style={{ overflow: "visible" }}
          >
            <line
              x1="1" y1="0" x2="1" y2={connectorHeight}
              stroke="#d97706"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.4"
            />
          </svg>

          {/* Node pill */}
          <div
            className="flex items-center gap-1.5 rounded px-2 py-1 border text-xs font-mono"
            style={{
              background: "#0d1623",
              borderColor: "#d9770640",
              color: "#d97706",
            }}
          >
            <span className="text-sm leading-none">{ICON[data.type]}</span>
            <span className="text-[10px] font-semibold whitespace-nowrap">{data.label}</span>
          </div>

          <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="font-mono text-xs max-w-52"
        style={{ background: "#0d1623", border: "1px solid #1f2937", color: "#e2e8f0" }}
      >
        <div className="font-semibold">{data.label}</div>
        <div style={{ color: "#64748b" }}>{TYPE_LABEL[data.type]} · {data.km.toFixed(1)} km</div>
        <div style={{ color: "#94a3b8" }} className="mt-1 text-[11px] leading-relaxed">{data.notes}</div>
      </TooltipContent>
    </Tooltip>
  )
}

export default React.memo(LogisticsNode)
