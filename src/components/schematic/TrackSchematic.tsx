import { useCallback, useMemo } from "react"
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
import type { TrackSection } from "@/types"

// ─── Layout constants ──────────────────────────────────────────────────────

const KM_SCALE    = 90   // px per km
const TRACK_Y     = 120  // Y for station nodes inside the 280px canvas
const LOGISTICS_Y = 20   // Y for logistics nodes (above the track)
const LOGISTICS_CONNECTOR_H = TRACK_Y - LOGISTICS_Y - 32

// ─── Node / edge type maps — defined outside component to avoid remounting ──

const nodeTypes: NodeTypes = {
  stationNode:   StationNode,
  logisticsNode: LogisticsNode,
}

const edgeTypes: EdgeTypes = {
  trackEdge: TrackEdge,
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function kmToX(km: number) {
  return km * KM_SCALE + 60
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

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      if (edge.id === selectedSectionId) {
        onSelectSection(null)
        return
      }
      const section = trackSections.find((s) => s.id === edge.id) ?? null
      onSelectSection(section)
    },
    [selectedSectionId, onSelectSection],
  )

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
      data:   {
        ...s,
        isSelected: s.id === selectedSectionId,
      } satisfies TrackEdgeData,
    }))
  }, [selectedSectionId])

  return (
    <div
      className="w-full shrink-0 border-y"
      style={{ height: "280px", background: "#060d14", borderColor: "#1f2937" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onEdgeClick={handleEdgeClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll
        zoomOnScroll={false}
        style={{ background: "#060d14" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#1a2535"
        />
        <Controls
          style={{ background: "#0d1623", border: "1px solid #1f2937" }}
        />
        <MiniMap
          position="bottom-right"
          style={{ background: "#080f18", border: "1px solid #1f2937" }}
          nodeColor="#1f2937"
          maskColor="#060d1490"
        />
      </ReactFlow>
    </div>
  )
}
