export type RunEvent = {
  at: string;
  level: "info" | "warn" | "error";
  type: string;
  actor: string;
  detail: string;
  metadata?: Record<string, unknown>;
};

export type RunRecord = {
  runId: string;
  workflow: string;
  startedAt: string;
  finishedAt?: string;
  events: RunEvent[];
  status: "running" | "completed" | "failed";
};

