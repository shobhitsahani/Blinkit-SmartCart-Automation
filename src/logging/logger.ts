/** Structured logger. No credentials/PII beyond address label. */

export type LogLevel = "INFO" | "WARNING" | "ERROR";

export interface LogEntry {
  timestamp: string;
  execution_id: string;
  flow: string;
  operation: string;
  status: string;
  category?: string;
  message: string;
}

export function log(
  executionId: string,
  flow: string,
  operation: string,
  status: string,
  message: string,
  level: LogLevel = "INFO",
  category?: string
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    execution_id: executionId,
    flow,
    operation,
    status,
    message
  };
  if (category) entry.category = category;
  const line = JSON.stringify(entry);
  if (level === "ERROR") console.error(line);
  else if (level === "WARNING") console.warn(line);
  else console.log(line);
  return entry;
}
