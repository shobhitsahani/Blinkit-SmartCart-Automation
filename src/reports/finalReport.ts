import type { ShoppingSummary } from "./summary.js";

/** Final human-readable execution report (TXT). */
export function finalReport(summary: ShoppingSummary): string {
  const lines = [
    `Blinkit SmartCart Automation — execution report`,
    `Execution ID : ${summary.execution_id}`,
    `Executed at  : ${summary.executed_at}`,
    `Address check: ${summary.address.status} (expected '${summary.address.expected}', displayed '${summary.address.displayed ?? "?"}')`,
    `Cart lines   : ${summary.cart.length} (subtotal ${summary.subtotal ?? "NOT_VERIFIED"} ${summary.currency}, total ${summary.total ?? "NOT_VERIFIED"} ${summary.currency})`,
    `Budget       : ${summary.budget} ${summary.currency} -> ${summary.budget_status}${summary.overrun ? ` (overrun ${summary.overrun})` : ""}`,
    `Unavailable  : ${summary.unavailable.length ? summary.unavailable.join(", ") : "none"}`,
    `Substitutions: ${summary.substitutions.length ? summary.substitutions.join(", ") : "none"}`,
    `Overall      : ${summary.overall_status}`,
    `Email        : ${summary.email_notification}`,
    `WhatsApp     : ${summary.whatsapp_notification}`,
    ...summary.warnings.map((w) => `WARNING: ${w}`),
    ...summary.errors.map((w) => `ERROR: ${w}`),
    `Order placed : NO — workflow stopped at the verified cart.`,
    `Payment      : NO — payment was never initiated.`
  ];
  return lines.join("\n") + "\n";
}
