import type { NotifyStatus } from "../types.js";

export interface EmailRequest {
  enabled: boolean;
  recipient: string;
  testMode: boolean;
  /** True only when the user completed authorized Gmail setup (see docs/pad-setup-limitations.md). */
  senderConfigured: boolean;
  subject: string;
  body: string;
}

export interface EmailResult {
  status: NotifyStatus;
  detail: string;
}

/** Build a professional subject/body from summary facts. Pure. */
export function buildEmailFromSummary(summary: {
  executionId: string;
  total: number | null;
  currency: string;
  budgetStatus: string;
  lines: Array<{ product: string; actualQty: number | null; unitPrice: number | null }>;
  orderPlaced: false;
  paymentInitiated: false;
}): { subject: string; body: string } {
  const subject = `Blinkit SmartCart summary ${summary.executionId} — budget ${summary.budgetStatus}`;
  const lines = summary.lines
    .map((l) => `- ${l.product}: qty ${l.actualQty ?? "?"} @ ${l.unitPrice ?? "?"} ${summary.currency}`)
    .join("\n");
  const body = [
    "Blinkit SmartCart Automation — verified cart summary (no order placed, no payment initiated).",
    "",
    `Execution: ${summary.executionId}`,
    `Cart total: ${summary.total ?? "NOT_VERIFIED"} ${summary.currency} (budget ${summary.budgetStatus})`,
    "",
    "Items:",
    lines,
    "",
    "This is an automated summary. The workflow stopped at the verified cart."
  ].join("\n");
  return { subject, body };
}

/**
 * Authorized-only send. Phase 1 never sends: test_mode => SKIPPED (drafted);
 * live without senderConfigured => FAILED (honest). Real sending happens in PAD
 * via the user's approved Gmail connection — see pad-flows/README.md.
 */
export function sendEmail(req: EmailRequest): EmailResult {
  if (!req.enabled) return { status: "SKIPPED", detail: "Email disabled in config." };
  if (req.testMode)
    return { status: "SKIPPED", detail: `test_mode: email to ${req.recipient} drafted, NOT sent. Subject: '${req.subject}'.` };
  if (!req.senderConfigured)
    return { status: "FAILED", detail: "Gmail sender not configured — complete authorized setup first (docs/pad-setup-limitations.md). Message NOT sent." };
  return { status: "FAILED", detail: "Live send is performed by the PAD EmailNotification subflow, not this helper. No message sent from here." };
}
