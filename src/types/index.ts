import type { Status } from "@/lib/status"

// ─── Route node ────────────────────────────────────────────────────────────

export type NodeType = "station" | "junction" | "depot"

export interface RouteNode {
  id: string
  label: string
  km: number
  type: NodeType
}

// ─── Schedule ──────────────────────────────────────────────────────────────

export interface PhaseSchedule {
  plannedStart: string // ISO date string "YYYY-MM-DD"
  plannedEnd: string
  actualStart: string | null
  actualEnd: string | null
}

export interface SectionSchedule {
  installation: PhaseSchedule
  commissioning: PhaseSchedule
  handover: PhaseSchedule
}

// ─── Track section ─────────────────────────────────────────────────────────

export type TrackType = "Ballasted" | "Slab Track" | "Elevated" | "Tunnel"

export interface TrackSection {
  id: string
  from: string
  to: string
  label: string
  length: string
  type: TrackType
  installation: Status
  commissioning: Status
  handover: Status
  schedule: SectionSchedule
}

// ─── Logistics point ───────────────────────────────────────────────────────

export type LogisticsType = "railhead" | "road_access" | "power_source"

export interface LogisticsPoint {
  id: string
  label: string
  type: LogisticsType
  km: number
  notes: string
}

// ─── App state ─────────────────────────────────────────────────────────────

export type SelectedSection = TrackSection | null
