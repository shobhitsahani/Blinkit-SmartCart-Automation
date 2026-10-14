import type { NotifyStatus } from "../types.js";

export interface WhatsAppResult {
  status: NotifyStatus;
  detail: string;
}

export function buildWhatsAppMessage(summary: {
  executionId: string;
  total: number | null;
  currency: string;
  budgetStatus: string;
  itemCount: number;
}): string {
  return (
    `Blinkit SmartCart ${summary.executionId}: ${summary.itemCount} item(s), ` +
    `total ${summary.total ?? "NOT_VERIFIED"} ${summary.currency}, budget ${summary.budgetStatus}. ` +
    `Cart verified — no order placed, no payment initiated.`
  );
}

/**
 * Supported-channel only. Phase 1 never sends: test_mode/disabled => SKIPPED;
 * live without a WhatsApp Business Platform (or other explicitly supported)
 * setup => UNSUPPORTED + manual-fallback note. Never claims SENT without proof.
 */
export function sendWhatsApp(opts: {
  enabled: boolean;
  recipient: string;
  testMode: boolean;
  businessConfigured: boolean;
  message: string;
}): WhatsAppResult {
  if (!opts.enabled) return { status: "SKIPPED", detail: "WhatsApp disabled in config." };
  if (opts.testMode)
    return { status: "SKIPPED", detail: `test_mode: WhatsApp to ${opts.recipient} drafted, NOT sent. '${opts.message}'` };
  if (!opts.businessConfigured)
    return {
      status: "UNSUPPORTED",
      detail:
        "No compliant WhatsApp integration configured (Business Platform access, templates, recipient opt-in required). " +
        "See docs/pad-setup-limitations.md for the documented manual demonstration fallback. Message NOT sent."
    };
  return { status: "FAILED", detail: "Live send is performed by the PAD WhatsAppNotification subflow, not this helper. No message sent from here." };
}
