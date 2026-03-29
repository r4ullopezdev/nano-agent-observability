import fs from "node:fs";
import path from "node:path";
import { exportRunJson, exportRunMarkdown } from "./exporters.js";
import { createEvent, toStructuredLog } from "./logger.js";
import { InMemoryRunStore } from "./runStore.js";

const store = new InMemoryRunStore();
const run = store.start("demo-run", "department-demo");

store.append(run.runId, createEvent("run.started", "orchestrator", "Workflow accepted."));
store.append(run.runId, createEvent("task.started", "manager", "Delegating work packet."));
store.append(run.runId, createEvent("audit.note", "reviewer", "Human checkpoint recorded."));
const finished = store.complete(run.runId, "completed");

const artifactDir = path.resolve("artifacts");
fs.mkdirSync(artifactDir, { recursive: true });
fs.writeFileSync(path.join(artifactDir, "run.json"), exportRunJson(finished));
fs.writeFileSync(path.join(artifactDir, "run.md"), exportRunMarkdown(finished));

finished.events.forEach((event) => console.log(toStructuredLog(event)));

