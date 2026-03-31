import fs from "node:fs";
import path from "node:path";
import { exportRunJson, exportRunMarkdown } from "./exporters.js";
import { writeInspector } from "./inspector.js";
import { createEvent, toStructuredLog } from "./logger.js";
import { InMemoryRunStore } from "./runStore.js";

const [, , command = "demo", target = "artifacts/run.json"] = process.argv;

if (command === "demo") {
  const store = new InMemoryRunStore();
  const run = store.start("demo-run", "department-demo");

  store.append(run.runId, createEvent("run.started", "orchestrator", "Workflow accepted.", { workflowMode: "department-based" }));
  store.append(
    run.runId,
    createEvent("approval.requested", "manager", "Human checkpoint requested before worker execution.", { taskId: "launch-readiness" }, "warn")
  );
  store.append(
    run.runId,
    createEvent("approval.approved", "reviewer", "Reviewer approved execution.", { reviewer: "ops-lead" })
  );
  store.append(
    run.runId,
    createEvent("task.started", "manager", "Delegating work packet.", { department: "research" })
  );
  const finished = store.complete(run.runId, "completed");

  const artifactDir = path.resolve("artifacts");
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(path.join(artifactDir, "run.json"), exportRunJson(finished));
  fs.writeFileSync(path.join(artifactDir, "run.md"), exportRunMarkdown(finished));
  writeInspector(finished, path.join(artifactDir, "run-inspector.html"));

  finished.events.forEach((event) => console.log(toStructuredLog(event)));
}

if (command === "inspect") {
  const absolute = path.resolve(target);
  const run = JSON.parse(fs.readFileSync(absolute, "utf8"));
  const outputPath = path.resolve("artifacts", "run-inspector.html");
  writeInspector(run, outputPath);
  console.log(`Inspector written to ${outputPath}`);
}
