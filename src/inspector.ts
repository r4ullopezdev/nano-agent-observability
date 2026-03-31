import fs from "node:fs";
import path from "node:path";
import type { RunRecord } from "./types.js";

export function renderRunInspector(run: RunRecord): string {
  const eventsByType = tally(run.events.map((event) => event.type));
  const eventsByActor = tally(run.events.map((event) => event.actor));
  const eventsByLevel = tally(run.events.map((event) => event.level));
  const duration = formatDuration(run.startedAt, run.finishedAt);
  const approvalEvents = eventsByType["approval.requested"] ?? 0;
  const errorEvents = eventsByLevel.error ?? 0;

  const eventCards = run.events
    .map((event, index) => {
      const metadataBlock =
        event.metadata && Object.keys(event.metadata).length > 0
          ? `<pre>${escapeHtml(JSON.stringify(event.metadata, null, 2))}</pre>`
          : "";

      return `
        <article class="event-card level-${event.level}">
          <div class="event-index">${String(index + 1).padStart(2, "0")}</div>
          <div class="event-body">
            <div class="event-header">
              <div class="event-type">${escapeHtml(event.type)}</div>
              <time>${escapeHtml(event.at)}</time>
            </div>
            <div class="event-meta">${escapeHtml(event.actor)} &middot; ${escapeHtml(event.level)}</div>
            <p>${escapeHtml(event.detail)}</p>
            ${metadataBlock}
          </div>
        </article>
      `;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Run Inspector</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #07111c;
        --panel: rgba(12, 22, 36, 0.92);
        --panel-strong: #0d1a2b;
        --ink: #eef5ff;
        --muted: #89a0bb;
        --accent: #7dd3fc;
        --accent-2: #6ee7b7;
        --warn: #fbbf24;
        --error: #f87171;
        --line: rgba(146, 177, 213, 0.18);
      }
      body {
        margin: 0;
        font-family: Inter, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top left, rgba(125, 211, 252, 0.14), transparent 28%),
          radial-gradient(circle at top right, rgba(110, 231, 183, 0.09), transparent 24%),
          linear-gradient(180deg, #08101a 0%, var(--bg) 100%);
        color: var(--ink);
      }
      main {
        max-width: 1240px;
        margin: 0 auto;
        padding: 36px 20px 72px;
      }
      .hero, .grid > section, .subgrid > section {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 24px;
        box-shadow: 0 20px 80px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(18px);
      }
      .hero {
        padding: 32px;
        margin-bottom: 22px;
      }
      h1, h2 {
        margin: 0 0 12px;
      }
      p {
        margin: 0;
      }
      .muted {
        color: var(--muted);
      }
      .grid {
        display: grid;
        grid-template-columns: 360px 1fr;
        gap: 22px;
      }
      .subgrid {
        display: grid;
        gap: 22px;
      }
      .stats, .timeline, .breakdown {
        padding: 24px;
      }
      .hero-grid {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 24px;
        align-items: start;
      }
      .hero-copy {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: fit-content;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid var(--line);
        color: var(--accent);
        background: rgba(125, 211, 252, 0.08);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .hero-copy p {
        line-height: 1.7;
      }
      .hero-kpis {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .kpi, .stat {
        padding: 14px 0;
        border-bottom: 1px solid var(--line);
      }
      .kpi:last-child, .stat:last-child {
        border-bottom: 0;
      }
      .kpi strong, .stat strong {
        display: block;
        margin-bottom: 6px;
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 700;
        background: rgba(110, 231, 183, 0.1);
        color: var(--accent-2);
      }
      .status.failed {
        background: rgba(248, 113, 113, 0.12);
        color: var(--error);
      }
      .status.running {
        background: rgba(251, 191, 36, 0.12);
        color: var(--warn);
      }
      .section-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 18px;
      }
      .breakdown-list {
        display: grid;
        gap: 12px;
      }
      .breakdown-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: center;
      }
      .breakdown-label {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .bar {
        height: 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        overflow: hidden;
      }
      .bar > span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
      }
      .timeline {
        padding-bottom: 10px;
      }
      .event-card {
        display: grid;
        grid-template-columns: 54px 1fr;
        gap: 14px;
        padding: 16px;
        border: 1px solid var(--line);
        border-radius: 18px;
        margin-bottom: 14px;
        background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
      }
      .event-card.level-warn {
        border-color: rgba(251, 191, 36, 0.28);
      }
      .event-card.level-error {
        border-color: rgba(248, 113, 113, 0.28);
      }
      .event-index {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border-radius: 14px;
        background: var(--panel-strong);
        border: 1px solid var(--line);
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
      }
      .event-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .event-type {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(125, 211, 252, 0.1);
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
      }
      .event-meta, time {
        margin-top: 10px;
        color: var(--muted);
        font-size: 14px;
      }
      .event-body p {
        margin-top: 12px;
        line-height: 1.7;
      }
      pre {
        margin: 12px 0 0;
        padding: 14px;
        border-radius: 14px;
        background: #081321;
        border: 1px solid var(--line);
        color: #cce5ff;
        overflow: auto;
        font-size: 12px;
        line-height: 1.6;
      }
      @media (max-width: 1024px) {
        .hero-grid, .grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 900px) {
        .hero-kpis {
          grid-template-columns: 1fr;
        }
        .event-card {
          grid-template-columns: 1fr;
        }
        .event-index {
          width: 36px;
          height: 36px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="hero-grid">
          <div class="hero-copy">
            <div class="badge">Run Inspector</div>
            <div>
              <h1>${escapeHtml(run.workflow)}</h1>
              <p class="muted">Run ${escapeHtml(run.runId)}</p>
            </div>
            <p>This inspector stays intentionally lightweight, but it now makes status, actor flow, approval pressure, and event chronology visible enough to debug multi-agent runs without requiring enterprise tooling.</p>
          </div>
          <div class="hero-kpis">
            <div class="kpi">
              <strong>Status</strong>
              <span class="status ${escapeHtml(run.status)}">${escapeHtml(run.status)}</span>
            </div>
            <div class="kpi">
              <strong>Duration</strong>
              <span>${escapeHtml(duration)}</span>
            </div>
            <div class="kpi">
              <strong>Approval events</strong>
              <span>${approvalEvents}</span>
            </div>
            <div class="kpi">
              <strong>Error events</strong>
              <span>${errorEvents}</span>
            </div>
          </div>
        </div>
      </section>
      <div class="grid">
        <div class="subgrid">
          <section class="stats">
            <div class="section-title">
              <h2>Run Metadata</h2>
            </div>
            <div class="stat"><strong>Started</strong><br />${escapeHtml(run.startedAt)}</div>
            <div class="stat"><strong>Finished</strong><br />${escapeHtml(run.finishedAt ?? "n/a")}</div>
            <div class="stat"><strong>Events</strong><br />${run.events.length}</div>
            <div class="stat"><strong>Distinct actors</strong><br />${Object.keys(eventsByActor).length}</div>
          </section>
          <section class="breakdown">
            <div class="section-title">
              <h2>Event Breakdown</h2>
            </div>
            <div class="breakdown-list">
              ${renderRows(eventsByType)}
            </div>
          </section>
          <section class="breakdown">
            <div class="section-title">
              <h2>Actor Map</h2>
            </div>
            <div class="breakdown-list">
              ${renderRows(eventsByActor)}
            </div>
          </section>
          <section class="breakdown">
            <div class="section-title">
              <h2>Signal Levels</h2>
            </div>
            <div class="breakdown-list">
              ${renderRows(eventsByLevel)}
            </div>
          </section>
        </div>
        <section class="timeline">
          <div class="section-title">
            <h2>Event Timeline</h2>
            <span class="muted">${run.events.length} events</span>
          </div>
          ${eventCards}
        </section>
      </div>
    </main>
  </body>
</html>`;
}

function tally(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});
}

function renderRows(counts: Record<string, number>): string {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0) || 1;

  return Object.entries(counts)
    .sort((left, right) => right[1] - left[1])
    .map(
      ([label, count]) => `
        <div class="breakdown-row">
          <div class="breakdown-label">
            <strong>${escapeHtml(label)}</strong>
            <div class="bar"><span style="width:${Math.max((count / total) * 100, 6)}%"></span></div>
          </div>
          <span>${count}</span>
        </div>
      `
    )
    .join("");
}

function formatDuration(startedAt: string, finishedAt?: string): string {
  if (!finishedAt) {
    return "running";
  }

  const durationMs = Date.parse(finishedAt) - Date.parse(startedAt);
  if (Number.isNaN(durationMs) || durationMs < 0) {
    return "n/a";
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(2)} s`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function writeInspector(run: RunRecord, outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, renderRunInspector(run), "utf8");
}
