import { useCallback, useMemo, useState } from "react"
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type EdgeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import StationNode, { type StationNodeData } from "./StationNode"
import LogisticsNode, { type LogisticsNodeData } from "./LogisticsNode"
import TrackEdge, { type TrackEdgeData } from "./TrackEdge"
import { routeNodes, trackSections, logisticsPoints } from "@/data/route"
import { deriveOverallStatus, STATUS_COLOUR, STATUS_BG, STATUS_LABEL } from "@/lib/status"
import type { TrackSection } from "@/types"

// ─── Layout constants ──────────────────────────────────────────────────────

const KM_SCALE    = 90   // px per km
const TRACK_Y     = 120  // station node Y inside the 280px canvas
const LOGISTICS_Y = 20   // logistics node Y
const LOGISTICS_CONNECTOR_H = TRACK_Y - LOGISTICS_Y - 32

// ─── Node / edge type maps — outside component to prevent remounting ───────

const nodeTypes: NodeTypes = {
  stationNode:   StationNode,
  logisticsNode: LogisticsNode,
}

const edgeTypes: EdgeTypes = {
  trackEdge: TrackEdge,
}

function kmToX(km: number) {
  return km * KM_SCALE + 60
}

// ─── Hover tooltip component ───────────────────────────────────────────────

interface EdgeTooltipProps {
  section: TrackSection
  x: number
  y: number
}

function EdgeHoverTooltip({ section, x, y }: EdgeTooltipProps) {
  const overall = deriveOverallStatus(section.installation, section.commissioning, section.handover)
  const colour  = STATUS_COLOUR[overall]

  return (
    <div
      style={{
        position:     "fixed",
        left:         x + 14,
        top:          y - 10,
        zIndex:       1000,
        pointerEvents:"none",
        background:   "var(--bg-card)",
        border:       "1px solid var(--border-strong)",
        borderRadius: "6px",
        padding:      "10px 14px",
        minWidth:     "164px",
        boxShadow:    "0 4px 16px rgba(0,0,0,0.5)",
        fontFamily:   "JetBrains Mono, monospace",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", marginBottom: "3px" }}>
        {section.id}
      </div>
      <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "7px" }}>
        {section.length} · {section.type}
      </div>
      <div
        style={{
          display:      "inline-block",
          fontSize:     "10px",
          padding:      "1px 8px",
          borderRadius: "4px",
          border:       `1px solid ${colour}60`,
          color:        colour,
          background:   STATUS_BG[overall],
          marginBottom: "8px",
        }}
      >
        {STATUS_LABEL[overall]}
      </div>
      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
        Click to view schedule →
      </div>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────

interface TrackSchematicProps {
  selectedSectionId: string | null
  onSelectSection: (section: TrackSection | null) => void
}

export default function TrackSchematic({
  selectedSectionId,
  onSelectSection,
}: TrackSchematicProps) {
  const [edgeTooltip, setEdgeTooltip] = useState<EdgeTooltipProps | null>(null)

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      setEdgeTooltip(null)
      if (edge.id === selectedSectionId) {
        onSelectSection(null)
        return
      }
      const section = trackSections.find((s) => s.id === edge.id) ?? null
      onSelectSection(section)
    },
    [selectedSectionId, onSelectSection],
  )

  const handleEdgeMouseEnter: EdgeMouseHandler = useCallback((event, edge) => {
    const section = trackSections.find((s) => s.id === edge.id)
    if (!section) return
    setEdgeTooltip({ section, x: event.clientX, y: event.clientY })
  }, [])

  const handleEdgeMouseLeave: EdgeMouseHandler = useCallback(() => {
    setEdgeTooltip(null)
  }, [])

  const nodes = useMemo<Node[]>(() => {
    const stationNodes: Node<StationNodeData>[] = routeNodes.map((n) => ({
      id:        n.id,
      type:      "stationNode",
      position:  { x: kmToX(n.km), y: TRACK_Y },
      data:      n,
      draggable: false,
    }))
    const logNodes: Node<LogisticsNodeData>[] = logisticsPoints.map((lp) => ({
      id:        lp.id,
      type:      "logisticsNode",
      position:  { x: kmToX(lp.km) - 50, y: LOGISTICS_Y },
      data:      { ...lp, trackY: LOGISTICS_CONNECTOR_H },
      draggable: false,
    }))
    return [...stationNodes, ...logNodes]
  }, [])

  const edges = useMemo<Edge[]>(() => {
    return trackSections.map((s) => ({
      id:     s.id,
      source: s.from,
      target: s.to,
      type:   "trackEdge",
      data:   { ...s, isSelected: s.id === selectedSectionId } satisfies TrackEdgeData,
    }))
  }, [selectedSectionId])

  return (
    <div
      className="w-full shrink-0"
      style={{
        height:       "280px",
        border:       "1px solid var(--border-strong)",
        borderRadius: "8px",
        overflow:     "hidden",
        background: `linear-gradient(
          to bottom,
          var(--bg-panel)  0px,
          var(--bg-panel)  calc(60% - 8px),
          var(--bg-inset)  calc(60% - 8px),
          var(--bg-inset)  calc(60% + 8px),
          var(--bg-panel)  calc(60% + 8px),
          var(--bg-panel)  100%
        )`,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onEdgeClick={handleEdgeClick}
        onEdgeMouseEnter={handleEdgeMouseEnter}
        onEdgeMouseLeave={handleEdgeMouseLeave}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll
        zoomOnScroll={false}
        style={{ background: "transparent" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--border-soft)"
        />
        <Controls
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-strong)",
          }}
        />
        <MiniMap
          position="bottom-right"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-strong)",
          }}
          nodeColor="var(--border-accent)"
          maskColor="#0b112080"
        />
      </ReactFlow>

      {/* Edge hover tooltip — rendered outside ReactFlow to escape SVG context */}
      {edgeTooltip && (
        <EdgeHoverTooltip
          section={edgeTooltip.section}
          x={edgeTooltip.x}
          y={edgeTooltip.y}
        />
      )}
    </div>
  )
}
