const FORBIDDEN = ["place order", "order now", "confirm purchase", "pay now", "make payment", "checkout"];

/**
 * STOP-guard: assert a planned step list contains no order/payment action.
 * Throws (never silently passes) when a forbidden step is present.
 */
export function assertNoPurchaseStep(plannedSteps: string[]): void {
  for (const step of plannedSteps) {
    const s = step.toLowerCase();
    for (const f of FORBIDDEN) {
      if (s.includes(f)) {
        throw new Error(`SAFETY BLOCK: planned step '${step}' matches forbidden action '${f}'. Execution must stop at the verified cart.`);
      }
    }
  }
}
