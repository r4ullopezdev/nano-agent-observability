import { describe, expect, test } from "vitest";
import { exportRunMarkdown } from "../src/exporters.js";
import { exportRunHistory } from "../src/history.js";
import { createEvent } from "../src/logger.js";
import { InMemoryRunStore } from "../src/runStore.js";

describe("observability exports", () => {
  test("renders run records as markdown", () => {
    const store = new InMemoryRunStore();
    store.start("run-1", "demo");
    store.append("run-1", createEvent("run.started", "orchestrator", "Started."));
    const run = store.complete("run-1", "completed");

    const markdown = exportRunMarkdown(run);

    expect(markdown).toContain("Workflow: demo");
    expect(markdown).toContain("run.started");
  });

  test("renders run history payloads", () => {
    const store = new InMemoryRunStore();
    store.start("run-1", "demo");
    store.append("run-1", createEvent("run.started", "orchestrator", "Started."));
    const run = store.complete("run-1", "completed");

    const history = exportRunHistory([run]);

    expect(history).toContain('"version": 1');
    expect(history).toContain('"workflow": "demo"');
  });
});
