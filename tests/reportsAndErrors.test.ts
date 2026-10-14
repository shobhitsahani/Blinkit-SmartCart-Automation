import { describe, expect, it } from "vitest";
import { AutomationError } from "../src/errors/AutomationError.js";
import { classifyError } from "../src/errors/classifier.js";
import { withRetry } from "../src/errors/retry.js";
import { buildEmailFromSummary, sendEmail } from "../src/integrations/gmail.js";
import { buildWhatsAppMessage, sendWhatsApp } from "../src/integrations/whatsapp.js";
import { finalReport } from "../src/reports/finalReport.js";
import { summaryToHtml, type ShoppingSummary } from "../src/reports/summary.js";
import { goodCart } from "./fixtures.js";

const summary: ShoppingSummary = {
  execution_id: "exec-test",
  executed_at: "2026-10-13T00:00:00.000Z",
  address: { expected: "Home", displayed: "Home", status: "PASS" },
  selections: [],
  cart: goodCart,
  subtotal: 70,
  charges: { delivery: null, discount: null, other: null },
  total: 70,
  budget: 500,
  currency: "INR",
  budget_status: "PASS",
  overrun: 0,
  unavailable: [],
  substitutions: [],
  overall_status: "PASS",
  email_notification: "SKIPPED",
  whatsapp_notification: "SKIPPED",
  warnings: [],
  errors: [],
  order_placed: false,
  payment_initiated: false
};

describe("reports", () => {
  it("HTML escapes content and states no order/payment", () => {
    const html = summaryToHtml({ ...summary, cart: [{ ...goodCart[0]!, product: "<Milk>&" }] });
    expect(html).toContain("&lt;Milk&gt;&amp;");
    expect(html).toContain("No order was placed");
  });
  it("TXT report confirms no purchase", () => {
    expect(finalReport(summary)).toMatch(/Order placed : NO/);
  });
});

describe("notifications (honest stubs)", () => {
  it("email drafts but never sends in test_mode", () => {
    const draft = buildEmailFromSummary({ executionId: "e1", total: 70, currency: "INR", budgetStatus: "PASS", lines: [], orderPlaced: false, paymentInitiated: false });
    expect(draft.subject).toMatch(/e1/);
    const r = sendEmail({ enabled: true, recipient: "a@example.com", testMode: true, senderConfigured: false, subject: draft.subject, body: draft.body });
    expect(r.status).toBe("SKIPPED");
  });
  it("whatsapp reports UNSUPPORTED without business setup (live)", () => {
    const msg = buildWhatsAppMessage({ executionId: "e1", total: 70, currency: "INR", budgetStatus: "PASS", itemCount: 2 });
    const r = sendWhatsApp({ enabled: true, recipient: "+91-0", testMode: false, businessConfigured: false, message: msg });
    expect(r.status).toBe("UNSUPPORTED");
    expect(r.detail).toMatch(/manual/i);
  });
});

describe("errors", () => {
  it("classifier maps address failures to safe-stop", () => {
    const e = classifyError("VerifyAddress", "address mismatch");
    expect(e.category).toBe("ADDRESS");
    expect(e.safeToContinue).toBe(false);
    expect(e.retryable).toBe(false);
  });
  it("classifier maps safety, auth, config, and ambiguous errors to safe-stop", () => {
    expect(classifyError("PlaceOrder", "forbidden order button").category).toBe("SAFETY");
    expect(classifyError("Login", "auth required OTP").category).toBe("AUTH");
    expect(classifyError("ValidateConfig", "schema invalid json").category).toBe("CONFIG");
    expect(classifyError("CompareProducts", "multiple ambiguous matches").category).toBe("PRODUCT_AMBIGUOUS");
  });
  it("withRetry retries transient only, then throws", async () => {
    let n = 0;
    const ok = await withRetry("op", { maxRetries: 2, delayMs: 1 }, async () => {
      n += 1;
      if (n < 2) throw new AutomationError("TRANSIENT", "slow", { retryable: true, safeToContinue: true });
      return "done";
    });
    expect(ok).toBe("done");
    await expect(
      withRetry("op", { maxRetries: 5, delayMs: 1 }, async () => {
        throw new AutomationError("ADDRESS", "bad addr", { retryable: false, safeToContinue: false });
      })
    ).rejects.toThrow();
  });
});
