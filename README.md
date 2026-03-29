# nano-agent-observability

[![CI](https://github.com/r4ullopezdev/nano-agent-observability/actions/workflows/ci.yml/badge.svg)](https://github.com/r4ullopezdev/nano-agent-observability/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

Tracing and logging utilities for auditable multi-agent workflows.

## Why this matters

Multi-agent systems fail quietly when orchestration is opaque. This package focuses on the minimum useful layer for traceability:

- structured logs
- run metadata
- event traces
- markdown and JSON exports
- audit hooks
- explicit run status handling

## Quickstart

```bash
npm install
npm run demo
```

The demo writes `artifacts/run.json` and `artifacts/run.md`.

