import type { RunEvent, RunRecord } from "./types.js";

export class InMemoryRunStore {
  private readonly runs = new Map<string, RunRecord>();

  start(runId: string, workflow: string): RunRecord {
    const run: RunRecord = {
      runId,
      workflow,
      startedAt: new Date().toISOString(),
      events: [],
      status: "running"
    };
    this.runs.set(runId, run);
    return run;
  }

  append(runId: string, event: RunEvent): void {
    const run = this.runs.get(runId);
    if (!run) {
      throw new Error(`Run '${runId}' does not exist.`);
    }
    run.events.push(event);
  }

  complete(runId: string, status: RunRecord["status"]): RunRecord {
    const run = this.runs.get(runId);
    if (!run) {
      throw new Error(`Run '${runId}' does not exist.`);
    }
    run.status = status;
    run.finishedAt = new Date().toISOString();
    return run;
  }

  get(runId: string): RunRecord | undefined {
    return this.runs.get(runId);
  }
}

