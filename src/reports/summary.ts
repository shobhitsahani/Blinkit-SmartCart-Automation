import type { CartLine, NotifyStatus, SelectionResult, Status } from "../types.js";

export interface ShoppingSummary {
  execution_id: string;
  executed_at: string;
  address: { expected: string; displayed: string | null; status: Status };
  selections: SelectionResult[];
  cart: CartLine[];
  subtotal: number | null;
  charges: { delivery: number | null; discount: number | null; other: number | null };
  total: number | null;
  budget: number;
  currency: string;
  budget_status: Status;
  overrun: number;
  unavailable: string[];
  substitutions: string[];
  overall_status: Status;
  email_notification: NotifyStatus;
  whatsapp_notification: NotifyStatus | "UNSUPPORTED";
  warnings: string[];
  errors: string[];
  order_placed: false;
  payment_initiated: false;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function summaryToHtml(summary: ShoppingSummary): string {
  const rows = summary.cart
    .map(
      (l) => `<tr><td>${escapeHtml(l.product)}</td><td>${l.requested_qty}</td><td>${l.actual_qty ?? "?"}</td>` +
        `<td>${l.unit_price ?? "?"} ${escapeHtml(summary.currency)}</td><td>${l.line_total ?? "?"} ${escapeHtml(summary.currency)}</td>` +
        `<td>${l.verified ? "verified" : "UNVERIFIED"}</td></tr>`
    )
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Blinkit SmartCart summary ${escapeHtml(summary.execution_id)}</title>
<style>body{font-family:Segoe UI,Arial,sans-serif;margin:2rem;color:#1f2937}table{border-collapse:collapse;width:100%}td,th{border:1px solid #9ca3af;padding:.4rem .6rem;text-align:left}.badge{display:inline-block;padding:.1rem .6rem;border-radius:999px;background:#dbeafe}.warn{background:#fef3c7}.fail{background:#fecaca}.pass{background:#bbf7d0}</style>
</head><body>
<h1>Blinkit SmartCart — shopping summary</h1>
<p>Execution <code>${escapeHtml(summary.execution_id)}</code> at ${escapeHtml(summary.executed_at)}.
Address verification: <span class="badge">${summary.address.status}</span>.
Budget: ${summary.budget} ${escapeHtml(summary.currency)} — <span class="badge">${summary.budget_status}</span>.
Overall: <span class="badge">${summary.overall_status}</span>.</p>
<table><thead><tr><th>Product</th><th>Req qty</th><th>Cart qty</th><th>Unit price</th><th>Line total</th><th>Check</th></tr></thead><tbody>
${rows}
</tbody></table>
<p>Subtotal: ${summary.subtotal ?? "NOT_VERIFIED"} ${escapeHtml(summary.currency)}; Total: ${summary.total ?? "NOT_VERIFIED"} ${escapeHtml(summary.currency)}.
Unavailable: ${summary.unavailable.length ? escapeHtml(summary.unavailable.join(", ")) : "none"}.
Substitutions: ${summary.substitutions.length ? escapeHtml(summary.substitutions.join(", ")) : "none"}.</p>
<p>Email: ${summary.email_notification}; WhatsApp: ${summary.whatsapp_notification}.</p>
<p><strong>No order was placed and no payment was initiated. The workflow stopped at the verified cart.</strong></p>
${summary.warnings.length ? `<h2>Warnings</h2><ul>${summary.warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}</ul>` : ""}
${summary.errors.length ? `<h2>Errors</h2><ul>${summary.errors.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}</ul>` : ""}
</body></html>`;
}
