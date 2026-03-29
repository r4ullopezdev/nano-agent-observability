import type { RunEvent } from "./types.js";

export function createEvent(
  type: string,
  actor: string,
  detail: string,
  metadata?: Record<string, unknown>,
  level: RunEvent["level"] = "info"
): RunEvent {
  return {
    at: new Date().toISOString(),
    level,
    type,
    actor,
    detail,
    metadata
  };
}

export function toStructuredLog(event: RunEvent): string {
  return JSON.stringify(event);
}

