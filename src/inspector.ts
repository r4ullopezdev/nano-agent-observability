import fs from "node:fs";
import path from "node:path";
import type { RunRecord } from "./types.js";

export function renderRunInspector(run: RunRecord): string {
  const eventCards = run.events
    .map(
      (event) => `
        <article class="event-card">
          <div class="event-type">${event.type}</div>
          <div class="event-meta">${event.actor} · ${event.level}</div>
          <p>${event.detail}</p>
        </article>
      `
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Run Inspector</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f3efe7;
        --panel: #fffdf8;
        --ink: #1f2722;
        --muted: #68756c;
        --accent: #0c6b58;
        --line: #d7d0c4;
      }
      body {
        margin: 0;
        font-family: "Segoe UI", sans-serif;
        background: radial-gradient(circle at top, #fff8e8, var(--bg));
        color: var(--ink);
      }
      main {
        max-width: 1100px;
        margin: 0 auto;
        padding: 32px 20px 60px;
      }
      .hero, .grid > section {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 18px;
        box-shadow: 0 18px 50px rgba(35, 38, 31, 0.08);
      }
      .hero {
        padding: 28px;
        margin-bottom: 20px;
      }
      h1, h2 { margin: 0 0 12px; }
      .muted { color: var(--muted); }
      .grid {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 20px;
      }
      .stats, .timeline {
        padding: 24px;
      }
      .stat {
        padding: 12px 0;
        border-bottom: 1px solid var(--line);
      }
      .event-card {
        padding: 16px;
        border: 1px solid var(--line);
        border-radius: 14px;
        margin-bottom: 14px;
        background: #fff;
      }
      .event-type {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 999px;
        background: #dff3ec;
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
      }
      .event-meta {
        margin-top: 10px;
        color: var(--muted);
        font-size: 14px;
      }
      @media (max-width: 900px) {
        .grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>${run.workflow}</h1>
        <p class="muted">Run ${run.runId} · ${run.status}</p>
        <p>This inspector is intentionally minimal: it makes run status, actor flow, and event chronology immediately visible without needing enterprise observability tooling.</p>
      </section>
      <div class="grid">
        <section class="stats">
          <h2>Run Metadata</h2>
          <div class="stat"><strong>Started</strong><br />${run.startedAt}</div>
          <div class="stat"><strong>Finished</strong><br />${run.finishedAt ?? "n/a"}</div>
          <div class="stat"><strong>Events</strong><br />${run.events.length}</div>
          <div class="stat"><strong>Status</strong><br />${run.status}</div>
        </section>
        <section class="timeline">
          <h2>Event Timeline</h2>
          ${eventCards}
        </section>
      </div>
    </main>
  </body>
</html>`;
}

export function writeInspector(run: RunRecord, outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, renderRunInspector(run), "utf8");
}
