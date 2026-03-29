import { describe, expect, test } from "vitest";
import { renderRunInspector } from "../src/inspector.js";
import type { RunRecord } from "../src/types.js";

describe("run inspector", () => {
  test("renders basic workflow metadata", () => {
    const run: RunRecord = {
      runId: "run-2",
      workflow: "demo-workflow",
      startedAt: "2026-03-29T00:00:00.000Z",
      finishedAt: "2026-03-29T00:00:05.000Z",
      status: "completed",
      events: [
        {
          at: "2026-03-29T00:00:00.000Z",
          level: "info",
          type: "run.started",
          actor: "orchestrator",
          detail: "Started."
        }
      ]
    };

    const html = renderRunInspector(run);
    expect(html).toContain("demo-workflow");
    expect(html).toContain("Event Timeline");
  });
});
