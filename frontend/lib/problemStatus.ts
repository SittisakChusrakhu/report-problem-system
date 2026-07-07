// Single source of truth for how the backend's Prisma enums (schema.prisma)
// map to Thai display text and MUI colors on the frontend.
// Backend: enum ProblemStatus { UNASSIGNED PENDING IN_PROGRESS RESOLVED CLOSED }
// Backend: enum ProblemType   { ACADEMIC FACILITY ADMINISTRATIVE OTHER }
//
// Previously every page/component compared `problem.status` against ad-hoc
// Thai strings like "ได้รับการแก้ปัญหาแล้ว" — those never matched the real
// enum values coming back from the API. Centralizing it here means there's
// exactly one place to update if the backend enum changes again.

export type ProblemStatus =
  | "UNASSIGNED"
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export const STATUS_LABELS: Record<ProblemStatus, string> = {
  UNASSIGNED: "รอมอบหมายอาจารย์",
  PENDING: "รอดำเนินการ",
  IN_PROGRESS: "กำลังดำเนินการ",
  RESOLVED: "แก้ไขแล้ว",
  CLOSED: "ปิดเรื่อง",
};

export type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

export const STATUS_COLORS: Record<ProblemStatus, ChipColor> = {
  UNASSIGNED: "default",
  PENDING: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "error",
};

export const getStatusLabel = (status: string): string =>
  STATUS_LABELS[status as ProblemStatus] || status;

export const getStatusColor = (status: string): ChipColor =>
  STATUS_COLORS[status as ProblemStatus] || "default";

// Simple 3-bucket grouping used by the dashboard charts (they were built
// around 3 buckets: resolved / in-progress / closed-or-rejected). Mapped onto
// the 5-value enum as: RESOLVED -> resolved, CLOSED -> rejected bucket,
// everything else (UNASSIGNED/PENDING/IN_PROGRESS) -> in-progress bucket.
// Revisit this grouping if the dashboards should show all 5 states distinctly.
export type StatusBucket = "resolved" | "inProgress" | "closed";

export const getStatusBucket = (status: string): StatusBucket => {
  if (status === "RESOLVED") return "resolved";
  if (status === "CLOSED") return "closed";
  return "inProgress";
};

export type ProblemType = "ACADEMIC" | "FACILITY" | "ADMINISTRATIVE" | "OTHER";

export const PROBLEM_TYPE_LABELS: Record<ProblemType, string> = {
  ACADEMIC: "วิชาการ",
  FACILITY: "สถานที่/อุปกรณ์",
  ADMINISTRATIVE: "งานธุรการ",
  OTHER: "อื่นๆ",
};

export const getProblemTypeLabel = (type: string): string =>
  PROBLEM_TYPE_LABELS[type as ProblemType] || type;
