# Design Note 001: Observability Scope

The project deliberately avoids pretending to be enterprise telemetry infrastructure.

The goal of v0.1 is narrower:

- emit structured events
- preserve run metadata
- export traces in durable formats
- provide a minimal human-readable inspector

This keeps the package useful for open-source orchestration projects without overpromising a full observability platform.
