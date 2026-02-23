import React from "react"
import { type EdgeProps } from "@xyflow/react"
import { deriveOverallStatus, STATUS_COLOUR } from "@/lib/status"
import type { TrackSection } from "@/types"

export type TrackEdgeData = TrackSection & { isSelected: boolean }

// ─── Rail geometry ─────────────────────────────────────────────────────────
const RAIL_HALF       = 7   // graph-px: distance from centre to each rail
const SLEEPER_HALF    = 14  // graph-px: half-length of each sleeper
const SLEEPER_SPACING = 22  // graph-px: sleeper centre-to-centre
const RAIL_WIDTH      = 2
const SLEEPER_WIDTH   = 1.5

function buildGeometry(x1: number, y1: number, x2: number, y2: number) {
  const dx  = x2 - x1
  const dy  = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return { topRail: "", botRail: "", sleepers: [] as string[] }

  const px = -dy / len  // unit perpendicular
  const py =  dx / len

  const topRail = `M${x1 + px * RAIL_HALF},${y1 + py * RAIL_HALF} L${x2 + px * RAIL_HALF},${y2 + py * RAIL_HALF}`
  const botRail = `M${x1 - px * RAIL_HALF},${y1 - py * RAIL_HALF} L${x2 - px * RAIL_HALF},${y2 - py * RAIL_HALF}`

  const count = Math.max(0, Math.floor(len / SLEEPER_SPACING) - 1)
  const sleepers: string[] = []
  for (let i = 1; i <= count; i++) {
    const t  = (i * SLEEPER_SPACING) / len
    const cx = x1 + dx * t
    const cy = y1 + dy * t
    sleepers.push(
      `M${cx + px * SLEEPER_HALF},${cy + py * SLEEPER_HALF} L${cx - px * SLEEPER_HALF},${cy - py * SLEEPER_HALF}`,
    )
  }

  return { topRail, botRail, sleepers }
}

function TrackEdge(props: EdgeProps<TrackEdgeData>) {
  const { id, sourceX, sourceY, targetX, targetY, data } = props
  if (!data) return null

  const overall    = deriveOverallStatus(data.installation, data.commissioning, data.handover)
  const colour     = STATUS_COLOUR[overall]
  const isSelected = data.isSelected

  const { topRail, botRail, sleepers } = buildGeometry(sourceX, sourceY, targetX, targetY)
  const midX     = (sourceX + targetX) / 2
  const midY     = (sourceY + targetY) / 2
  const filterId = `glow-${id}`

  return (
    <g style={{ cursor: "pointer" }}>
      {isSelected && (
        <defs>
          <filter id={filterId} x="-30%" y="-300%" width="160%" height="700%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* Wide invisible hit area */}
      <path
        d={`M${sourceX},${sourceY} L${targetX},${targetY}`}
        stroke="transparent"
        strokeWidth={32}
        fill="none"
      />

      {/* Sleeper ticks — 40% opacity when not selected */}
      {sleepers.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={isSelected ? colour : "#2d3f5c"}
          strokeWidth={SLEEPER_WIDTH}
          opacity={isSelected ? 0.9 : 0.4}
          filter={isSelected ? `url(#${filterId})` : undefined}
        />
      ))}

      {/* Top rail — 90% opacity when not selected */}
      <path
        d={topRail}
        stroke={colour}
        strokeWidth={RAIL_WIDTH}
        fill="none"
        opacity={isSelected ? 1 : 0.9}
        filter={isSelected ? `url(#${filterId})` : undefined}
      />

      {/* Bottom rail */}
      <path
        d={botRail}
        stroke={colour}
        strokeWidth={RAIL_WIDTH}
        fill="none"
        opacity={isSelected ? 1 : 0.9}
        filter={isSelected ? `url(#${filterId})` : undefined}
      />

      {/* Section label above midpoint */}
      <text
        x={midX}
        y={midY - 18}
        textAnchor="middle"
        fontSize={11}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={600}
        fill={isSelected ? "#e8edf5" : "#4a6080"}
      >
        {data.label}
      </text>

      {/* Status dot below midpoint */}
      <circle
        cx={midX}
        cy={midY + 18}
        r={3.5}
        fill={colour}
        opacity={isSelected ? 1 : 0.85}
      />
    </g>
  )
}

export default React.memo(TrackEdge)
