// ─── Status constants & helpers ────────────────────────────────────────────

export const STATUS = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETE: "COMPLETE",
  BLOCKED: "BLOCKED",
} as const

export type Status = (typeof STATUS)[keyof typeof STATUS]

// Tailwind utility class tokens (use with cn())
export const STATUS_COLOUR: Record<Status, string> = {
  NOT_STARTED: "#4b5563",
  IN_PROGRESS: "#d97706",
  COMPLETE:    "#16a34a",
  BLOCKED:     "#dc2626",
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
