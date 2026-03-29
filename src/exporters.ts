import type { RunRecord } from "./types.js";

export function exportRunJson(run: RunRecord): string {
  return JSON.stringify(run, null, 2);
}

export function exportRunMarkdown(run: RunRecord): string {
  const events = run.events
    .map((event) => `- ${event.at} | ${event.level} | ${event.type} | ${event.actor} | ${event.detail}`)
    .join("\n");

  return `# Run ${run.runId}\n\n- Workflow: ${run.workflow}\n- Status: ${run.status}\n\n## Events\n${events}\n`;
}

