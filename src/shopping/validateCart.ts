import type { CartLine, Status } from "../types.js";

export interface CartValidation {
  lines: CartLine[];
  subtotal: number | null;
  total: number | null;
  budget: number;
  budget_status: Status;
  overrun: number;
  overall: Status;
  notes: string[];
}

/**
 * Validate cart lines from VERIFIED display data only.
 * - Any line with null qty/price => NOT_VERIFIED overall; budget => NOT_VERIFIED (never PASS).
 * - Qty mismatch (non-adjustable) or failed line => overall FAIL.
 * - Budget check on verified total only.
 */
export function validateCart(lines: CartLine[], budget: number, allowQuantityAdjustment: boolean): CartValidation {
  const notes: string[] = [];
  let subtotal = 0;
  let hasUnverified = false;
  let hasMismatch = false;

  for (const line of lines) {
    if (line.actual_qty === null || line.unit_price === null || line.line_total === null) {
      hasUnverified = true;
      notes.push(`'${line.product}': price/qty not verified — marked NOT_VERIFIED.`);
      continue;
    }
    if (line.actual_qty !== line.requested_qty) {
      hasMismatch = true;
      notes.push(
        `'${line.product}': requested ${line.requested_qty}, cart shows ${line.actual_qty}` +
          (allowQuantityAdjustment ? " (adjustment allowed, recorded as WARNING)." : " (adjustment NOT allowed).")
      );
    }
    subtotal += line.line_total;
  }

  if (hasUnverified) {
    return { lines, subtotal: null, total: null, budget, budget_status: "NOT_VERIFIED", overrun: 0, overall: "NOT_VERIFIED", notes };
  }
  const total = subtotal; // charges/discounts added by caller only when explicitly displayed
  if (total > budget) {
    notes.push(`Budget exceeded by ${total - budget} (total ${total} vs budget ${budget}). Never proceed to checkout.`);
    return { lines, subtotal, total, budget, budget_status: "FAIL", overrun: total - budget, overall: "FAIL", notes };
  }
  if (hasMismatch && !allowQuantityAdjustment) {
    return { lines, subtotal, total, budget, budget_status: "PASS", overrun: 0, overall: "FAIL", notes };
  }
  if (hasMismatch) {
    return { lines, subtotal, total, budget, budget_status: "PASS", overrun: 0, overall: "WARNING", notes };
  }
  return { lines, subtotal, total, budget, budget_status: "PASS", overrun: 0, overall: "PASS", notes };
}
