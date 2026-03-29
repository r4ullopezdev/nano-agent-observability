# nano-agent-observability

[![CI](https://github.com/r4ullopezdev/nano-agent-observability/actions/workflows/ci.yml/badge.svg)](https://github.com/r4ullopezdev/nano-agent-observability/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

Tracing and logging utilities for auditable multi-agent workflows.

![Run inspector preview](./assets/run-inspector.svg)

## Why this matters

Multi-agent systems fail quietly when orchestration is opaque. This package focuses on the minimum useful layer for traceability:

- structured logs
- run metadata
- event traces
- markdown and JSON exports
- audit hooks
- explicit run status handling
- minimal HTML run inspector

## Quickstart

```bash
npm install
npm run demo
npm run inspect
```

The demo writes:

- `artifacts/run.json`
- `artifacts/run.md`
- `artifacts/run-inspector.html`

## Design note

See [docs/design-note-001-observability-scope.md](./docs/design-note-001-observability-scope.md) for the rationale behind keeping observability intentionally small and audit-oriented.

