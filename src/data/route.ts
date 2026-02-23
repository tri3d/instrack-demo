import { STATUS } from "@/lib/status"
import type { RouteNode, TrackSection, LogisticsPoint } from "@/types"

// ─── Route nodes ───────────────────────────────────────────────────────────

export const routeNodes: RouteNode[] = [
  { id: "A", label: "Millfield Jn",      km: 0.0,  type: "junction" },
  { id: "B", label: "Eastway Halt",      km: 2.4,  type: "station"  },
  { id: "C", label: "Queensbury Tunnel", km: 5.1,  type: "junction" },
  { id: "D", label: "Northgate Depot",   km: 8.8,  type: "depot"    },
  { id: "E", label: "Silverbridge Jn",   km: 11.5, type: "junction" },
  { id: "F", label: "Apex Terminal",     km: 14.0, type: "station"  },
]

// ─── Track sections ────────────────────────────────────────────────────────

export const trackSections: TrackSection[] = [
  {
    id: "S1",
    from: "A",
    to: "B",
    label: "S1",
    length: "2.4 km",
    type: "Ballasted",
    installation:  STATUS.COMPLETE,
    commissioning: STATUS.COMPLETE,
    handover:      STATUS.COMPLETE,
    schedule: {
      installation:  { plannedStart: "2024-01-08", plannedEnd: "2024-03-01", actualStart: "2024-01-10", actualEnd: "2024-02-28" },
      commissioning: { plannedStart: "2024-03-04", plannedEnd: "2024-04-12", actualStart: "2024-03-05", actualEnd: "2024-04-10" },
      handover:      { plannedStart: "2024-04-15", plannedEnd: "2024-05-03", actualStart: "2024-04-16", actualEnd: "2024-05-02" },
    },
  },
  {
    id: "S2",
    from: "B",
    to: "C",
    label: "S2",
    length: "2.7 km",
    type: "Tunnel",
    installation:  STATUS.COMPLETE,
    commissioning: STATUS.IN_PROGRESS,
    handover:      STATUS.NOT_STARTED,
    schedule: {
      installation:  { plannedStart: "2024-02-05", plannedEnd: "2024-04-19", actualStart: "2024-02-12", actualEnd: "2024-04-25" },
      commissioning: { plannedStart: "2024-04-22", plannedEnd: "2024-06-14", actualStart: "2024-04-29", actualEnd: null },
      handover:      { plannedStart: "2024-06-17", plannedEnd: "2024-07-05", actualStart: null,         actualEnd: null },
    },
  },
  {
    id: "S3",
    from: "C",
    to: "D",
    label: "S3",
    length: "3.7 km",
    type: "Elevated",
    installation:  STATUS.IN_PROGRESS,
    commissioning: STATUS.NOT_STARTED,
    handover:      STATUS.NOT_STARTED,
    schedule: {
      installation:  { plannedStart: "2024-03-11", plannedEnd: "2024-06-28", actualStart: "2024-03-18", actualEnd: null },
      commissioning: { plannedStart: "2024-07-01", plannedEnd: "2024-08-23", actualStart: null,         actualEnd: null },
      handover:      { plannedStart: "2024-08-26", plannedEnd: "2024-09-13", actualStart: null,         actualEnd: null },
    },
  },
  {
    id: "S4",
    from: "D",
    to: "E",
    label: "S4",
    length: "2.7 km",
    type: "Slab Track",
    installation:  STATUS.BLOCKED,
    commissioning: STATUS.NOT_STARTED,
    handover:      STATUS.NOT_STARTED,
    schedule: {
      installation:  { plannedStart: "2024-04-08", plannedEnd: "2024-07-12", actualStart: "2024-04-15", actualEnd: null },
      commissioning: { plannedStart: "2024-07-15", plannedEnd: "2024-09-06", actualStart: null,         actualEnd: null },
      handover:      { plannedStart: "2024-09-09", plannedEnd: "2024-09-27", actualStart: null,         actualEnd: null },
    },
  },
  {
    id: "S5",
    from: "E",
    to: "F",
    label: "S5",
    length: "2.5 km",
    type: "Ballasted",
    installation:  STATUS.NOT_STARTED,
    commissioning: STATUS.NOT_STARTED,
    handover:      STATUS.NOT_STARTED,
    schedule: {
      installation:  { plannedStart: "2024-06-03", plannedEnd: "2024-08-23", actualStart: null, actualEnd: null },
      commissioning: { plannedStart: "2024-08-26", plannedEnd: "2024-10-11", actualStart: null, actualEnd: null },
      handover:      { plannedStart: "2024-10-14", plannedEnd: "2024-11-01", actualStart: null, actualEnd: null },
    },
  },
]

// ─── Logistics points ──────────────────────────────────────────────────────

export const logisticsPoints: LogisticsPoint[] = [
  {
    id: "L1",
    label: "Eastway Railhead",
    type: "railhead",
    km: 2.4,
    notes: "Primary delivery point for track panels and sleepers",
  },
  {
    id: "L2",
    label: "Queensbury Road Access",
    type: "road_access",
    km: 5.1,
    notes: "HGV access via A-road; height restriction 4.2 m",
  },
  {
    id: "L3",
    label: "Northgate Power Feed",
    type: "power_source",
    km: 8.8,
    notes: "25 kV traction power supply, commissioned 2024-03-01",
  },
]

// ─── Today reference for Gantt ─────────────────────────────────────────────

export const PROJECT_START = "2024-01-01"
export const PROJECT_END   = "2024-11-30"
