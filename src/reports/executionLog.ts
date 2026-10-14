import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import type { LogEntry } from "../logging/logger.js";

const HEADER = "timestamp,execution_id,flow,operation,status,category,message";

/** Append log entries to a CSV file (writes header when creating). Fields are quoted. */
export function appendLogCsv(path: string, entries: LogEntry[]): void {
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = entries.map((e) =>
    [e.timestamp, e.execution_id, e.flow, e.operation, e.status, e.category ?? "", e.message].map(q).join(",")
  );
  if (!existsSync(path)) writeFileSync(path, HEADER + "\n");
  appendFileSync(path, lines.join("\n") + "\n");
}
