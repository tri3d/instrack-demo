// ─── Status constants & helpers ────────────────────────────────────────────

export const STATUS = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETE:    "COMPLETE",
  BLOCKED:     "BLOCKED",
} as const

export type Status = (typeof STATUS)[keyof typeof STATUS]

// Foreground colours — matched to the navy theme CSS variables
// Keep as JS values (not CSS vars) so they work in SVG attributes
export const STATUS_COLOUR: Record<Status, string> = {
  NOT_STARTED: "#4a6080",  // --status-none
  IN_PROGRESS: "#f59e0b",  // --status-progress
  COMPLETE:    "#22c55e",  // --status-complete
  BLOCKED:     "#ef4444",  // --status-blocked
}

// Background tints for badges / headers
export const STATUS_BG: Record<Status, string> = {
  NOT_STARTED: "#131f30",  // --status-none-bg
  IN_PROGRESS: "#2a1f08",  // --status-progress-bg
  COMPLETE:    "#0f2e1a",  // --status-complete-bg
  BLOCKED:     "#2a0f0f",  // --status-blocked-bg
}

export const STATUS_LABEL: Record<Status, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETE:    "Complete",
  BLOCKED:     "Blocked",
}

/** Derive the overall section status from its three phase statuses. */
export function deriveOverallStatus(
  installation: Status,
  commissioning: Status,
  handover: Status,
): Status {
  const phases = [installation, commissioning, handover]
  if (phases.includes(STATUS.BLOCKED)) return STATUS.BLOCKED
  if (phases.every((p) => p === STATUS.COMPLETE)) return STATUS.COMPLETE
  if (phases.includes(STATUS.IN_PROGRESS)) return STATUS.IN_PROGRESS
  if (phases.some((p) => p === STATUS.COMPLETE || p === STATUS.IN_PROGRESS))
    return STATUS.IN_PROGRESS
  return STATUS.NOT_STARTED
}

export const ALL_STATUSES: Status[] = [
  STATUS.NOT_STARTED,
  STATUS.IN_PROGRESS,
  STATUS.COMPLETE,
  STATUS.BLOCKED,
]
