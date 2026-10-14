import { AutomationError } from "./AutomationError.js";

export interface RetryPolicy {
  maxRetries: number;
  delayMs: number;
}

/** Retry transient failures only, bounded. Non-retryable errors rethrow immediately. */
export async function withRetry<T>(operation: string, policy: RetryPolicy, fn: () => Promise<T>): Promise<T> {
  let attempt = 0;
  // biome-ignore lint/suspicious/noAssignInExpressions: intentional retry loop
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const auto = err instanceof AutomationError ? err : null;
      if (!auto?.retryable || attempt >= policy.maxRetries) throw err;
      attempt += 1;
      await new Promise((r) => setTimeout(r, policy.delayMs));
      void operation;
    }
  }
}
