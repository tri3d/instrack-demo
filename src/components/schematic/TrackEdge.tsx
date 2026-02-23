import React, { useCallback } from "react"
import { type EdgeProps, getStraightPath } from "@xyflow/react"
import { deriveOverallStatus, STATUS_COLOUR } from "@/lib/status"
import type { TrackSection } from "@/types"

export type TrackEdgeData = TrackSection & { selected?: boolean; onSelect: (id: string) => void }

const RAIL_GAP   = 5   // px between the two rails
const SLEEPER_SPACING = 18 // px between sleepers
const SLEEPER_LEN     = 14 // px sleeper extends beyond each rail

function buildDualRailPath(
  x1: number, y1: number,
  x2: number, y2: number,
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return { topRail: "", botRail: "", sleepers: [] as string[] }

  // Unit perpendicular
  const px = -dy / len
  const py =  dx / len

  const offset = RAIL_GAP / 2

  // Top rail endpoints
  const t1x = x1 + px * offset, t1y = y1 + py * offset
  const t2x = x2 + px * offset, t2y = y2 + py * offset

  // Bottom rail endpoints
  const b1x = x1 - px * offset, b1y = y1 - py * offset
  const b2x = x2 - px * offset, b2y = y2 - py * offset

  const topRail = `M${t1x},${t1y} L${t2x},${t2y}`
  const botRail = `M${b1x},${b1y} L${b2x},${b2y}`

  // Sleepers
  const count = Math.floor(len / SLEEPER_SPACING) - 1
  const sleepers: string[] = []
  for (let i = 1; i <= count; i++) {
    const t = (i * SLEEPER_SPACING) / len
    const cx = x1 + dx * t
    const cy = y1 + dy * t
    const half = (RAIL_GAP / 2 + SLEEPER_LEN / 2)
    const sx1 = cx + px * half
    const sy1 = cy + py * half
    const sx2 = cx - px * half
    const sy2 = cy - py * half
    sleepers.push(`M${sx1},${sy1} L${sx2},${sy2}`)
  }

  return { topRail, botRail, sleepers }
}

function TrackEdge(props: EdgeProps<TrackEdgeData>) {
  const {
    id, sourceX, sourceY, targetX, targetY,
    data, selected,
  } = props

  if (!data) return null

  const overall  = deriveOverallStatus(data.installation, data.commissioning, data.handover)
  const colour   = STATUS_COLOUR[overall]
  const isSelected = selected ?? data.selected ?? false

  const { topRail, botRail, sleepers } = buildDualRailPath(
    sourceX, sourceY, targetX, targetY,
  )

  const [, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2

  const filterId = `glow-${id}`

  const handleClick = useCallback(
    () => data.onSelect(id),
    [data, id],
  )

  return (
    <g onClick={handleClick} style={{ cursor: "pointer" }}>
      {isSelected && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* Invisible wide hit area */}
      <path
        d={`M${sourceX},${sourceY} L${targetX},${targetY}`}
        stroke="transparent"
        strokeWidth={24}
        fill="none"
      />

      {/* Sleepers */}
      {sleepers.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={isSelected ? colour : "#374151"}
          strokeWidth={2}
          opacity={isSelected ? 0.8 : 0.6}
          filter={isSelected ? `url(#${filterId})` : undefined}
        />
      ))}

      {/* Top rail */}
      <path
        d={topRail}
        stroke={colour}
        strokeWidth={2}
        fill="none"
        filter={isSelected ? `url(#${filterId})` : undefined}
        opacity={isSelected ? 1 : 0.8}
      />

      {/* Bottom rail */}
      <path
        d={botRail}
        stroke={colour}
        strokeWidth={2}
        fill="none"
        filter={isSelected ? `url(#${filterId})` : undefined}
        opacity={isSelected ? 1 : 0.8}
      />

      {/* Section label above midpoint */}
      <text
        x={midX}
        y={midY - 14}
        textAnchor="middle"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={600}
        fill={isSelected ? "#e2e8f0" : "#64748b"}
      >
        {data.label}
      </text>

      {/* Status dot below midpoint */}
      <circle
        cx={midX}
        cy={midY + 14}
        r={3}
        fill={colour}
        opacity={0.9}
      />
    </g>
  )
}

export default React.memo(TrackEdge)
