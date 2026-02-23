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
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import StationNode, { type StationNodeData } from "./StationNode"
import LogisticsNode, { type LogisticsNodeData } from "./LogisticsNode"
import TrackEdge, { type TrackEdgeData } from "./TrackEdge"
import { routeNodes, trackSections, logisticsPoints } from "@/data/route"
import type { TrackSection } from "@/types"

// ─── Layout constants ──────────────────────────────────────────────────────

const KM_SCALE    = 90  // px per km
const TRACK_Y     = 140 // Y position of the track line
const LOGISTICS_Y = 30  // Y position of logistics nodes
const LOGISTICS_CONNECTOR_H = TRACK_Y - LOGISTICS_Y - 36 // approx connector length

// ─── Node / edge type registration ────────────────────────────────────────

const nodeTypes: NodeTypes = {
  stationNode:    StationNode,
  logisticsNode:  LogisticsNode,
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

  const handleEdgeSelect = useCallback(
    (edgeId: string) => {
      if (edgeId === selectedSectionId) {
        onSelectSection(null)
        return
      }
      const section = trackSections.find((s) => s.id === edgeId) ?? null
      onSelectSection(section)
    },
    [selectedSectionId, onSelectSection],
  )

  const nodes = useMemo<Node[]>(() => {
    const stationNodes: Node<StationNodeData>[] = routeNodes.map((n) => ({
      id:       n.id,
      type:     "stationNode",
      position: { x: kmToX(n.km), y: TRACK_Y },
      data:     n,
      draggable: false,
    }))

    const logNodes: Node<LogisticsNodeData>[] = logisticsPoints.map((lp) => ({
      id:       lp.id,
      type:     "logisticsNode",
      position: { x: kmToX(lp.km) - 50, y: LOGISTICS_Y },
      data:     { ...lp, trackY: LOGISTICS_CONNECTOR_H },
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
        onSelect: handleEdgeSelect,
      } satisfies TrackEdgeData,
      selected: s.id === selectedSectionId,
    }))
  }, [selectedSectionId, handleEdgeSelect])

  return (
    <div className="w-full flex-1 min-h-0" style={{ background: "#060d14" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
        zoomOnScroll={false}
        style={{ background: "#060d14" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#1f2937"
        />
        <Controls
          style={{
            background: "#0d1623",
            border: "1px solid #1f2937",
          }}
        />
        <MiniMap
          position="bottom-right"
          style={{
            background: "#080f18",
            border: "1px solid #1f2937",
          }}
          nodeColor="#1f2937"
          maskColor="#060d1490"
        />
      </ReactFlow>
    </div>
  )
}
