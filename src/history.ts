import fs from "node:fs";
import path from "node:path";
import type { RunRecord } from "./types.js";

export type RunHistory = {
  version: 1;
  generatedAt: string;
  runs: RunRecord[];
};

export function importRunRecord(filePath: string): RunRecord {
  const absolutePath = path.resolve(filePath);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8")) as RunRecord;
}

export function exportRunHistory(runs: RunRecord[]): string {
  const history: RunHistory = {
    version: 1,
    generatedAt: new Date().toISOString(),
    runs
  };

  return JSON.stringify(history, null, 2);
}

export function importRunHistory(filePath: string): RunHistory {
  const absolutePath = path.resolve(filePath);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8")) as RunHistory;
}

export function writeRunHistory(runs: RunRecord[], outputPath: string): void {
  const absolutePath = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, exportRunHistory(runs), "utf8");
}
