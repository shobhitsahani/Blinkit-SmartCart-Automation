import { mkdirSync, writeFileSync } from "node:fs";
import { loadConfig } from "../config/loader.js";
import { verifyAddress } from "../shopping/verifyAddress.js";
import { compareProducts } from "../shopping/compareProducts.js";
import { validateCart } from "../shopping/validateCart.js";
import { assertNoPurchaseStep } from "../shopping/cartGuard.js";
import { buildEmailFromSummary, sendEmail } from "../integrations/gmail.js";
import { buildWhatsAppMessage, sendWhatsApp } from "../integrations/whatsapp.js";
import { summaryToHtml, type ShoppingSummary } from "./summary.js";
import { appendLogCsv } from "./executionLog.js";
import { finalReport } from "./finalReport.js";
import { log, type LogEntry } from "../logging/logger.js";
import type { CartLine, ProductCandidate } from "../types.js";

/**
 * Sample run in test_mode with MOCK product data (labeled illustrative).
 * Real Blinkit browsing happens in PAD; this proves the pipeline end-to-end
 * without purchases or sends.
 */
const MOCK_CATALOG: Record<string, ProductCandidate[]> = {
  milk: [
    { name: "Amul Taaza Milk 500ml", brand: "Amul", pack_size: "500ml", unit_price: 30, available: true },
    { name: "Mother Dairy Milk 500ml", brand: "Mother Dairy", pack_size: "500ml", unit_price: 29, available: true }
  ],
  bread: [
    { name: "Harvest Gold White Bread 400g", brand: "Harvest Gold", pack_size: "400g", unit_price: 40, available: true }
  ],
  yogurt: [
    { name: "Epigamia Natural Yogurt 90g", brand: "Epigamia", pack_size: "90g", unit_price: 35, available: true }
  ]
};

const configPath = process.argv[2] ?? "config.example.json";
const cfg = loadConfig(configPath);
const executionId = `exec-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const logs: LogEntry[] = [];
const say = (flow: string, op: string, status: string, msg: string, level: "INFO" | "WARNING" | "ERROR" = "INFO") =>
  logs.push(log(executionId, flow, op, status, msg, level));

say("Main", "ValidateConfig", "PASS", `Config OK: ${cfg.items.length} items, budget ${cfg.budget}.`, "INFO");
assertNoPurchaseStep(["Open Blinkit", "Verify address", "Search items", "Add to cart", "Verify cart", "Generate summary"]);
say("Main", "SafetyGuard", "PASS", "Planned steps contain no order/payment action.", "INFO");

// Address gate: test_mode simulates the verified display (PAD verifies the real one).
const addr = verifyAddress(cfg.delivery_address.label, cfg.delivery_address.label);
say("ShoppingProcess", "VerifyAddress", addr.status, addr.detail, addr.status === "PASS" ? "INFO" : "ERROR");
if (addr.status !== "PASS") throw new Error("Address verification failed — stopping.");

const cart: CartLine[] = [];
const warnings: string[] = [];
const errors: string[] = [];
const unavailable: string[] = [];
const substitutions: string[] = [];
for (const item of cfg.items) {
  const sel = compareProducts(item, MOCK_CATALOG[item.name.toLowerCase()] ?? [], cfg.preferences.allow_substitutions);
  say("ShoppingProcess", `Select:${item.name}`, sel.status, sel.rationale, sel.status === "PASS" ? "INFO" : "ERROR");
  if (sel.status !== "PASS" || sel.selected === null) {
    unavailable.push(item.name);
    errors.push(`'${item.name}' unavailable: ${sel.rationale}`);
    continue;
  }
  if (sel.substituted) substitutions.push(`${item.name} -> ${sel.selected}`);
  cart.push({
    product: sel.selected,
    brand: sel.brand,
    pack_size: sel.pack_size,
    requested_qty: item.quantity,
    actual_qty: item.quantity, // mock verified quantity
    unit_price: sel.unit_price,
    line_total: (sel.unit_price ?? 0) * item.quantity,
    verified: true
  });
}

const cartCheck = validateCart(cart, cfg.budget, cfg.preferences.allow_quantity_adjustment);
for (const n of cartCheck.notes) say("ShoppingProcess", "ValidateCart", cartCheck.overall, n, cartCheck.overall === "PASS" ? "INFO" : cartCheck.overall === "WARNING" ? "WARNING" : "ERROR");

const emailDraft = buildEmailFromSummary({
  executionId,
  total: cartCheck.total,
  currency: cfg.currency,
  budgetStatus: cartCheck.budget_status,
  lines: cart.map((l) => ({ product: l.product, actualQty: l.actual_qty, unitPrice: l.unit_price })),
  orderPlaced: false,
  paymentInitiated: false
});
const email = sendEmail({ enabled: cfg.notifications.email_enabled, recipient: cfg.notifications.email_recipient, testMode: cfg.notifications.test_mode, senderConfigured: false, subject: emailDraft.subject, body: emailDraft.body });
say("EmailNotification", "Send", email.status, email.detail, email.status === "FAILED" ? "ERROR" : "INFO");
const wa = sendWhatsApp({ enabled: cfg.notifications.whatsapp_enabled, recipient: cfg.notifications.whatsapp_recipient, testMode: cfg.notifications.test_mode, businessConfigured: false, message: buildWhatsAppMessage({ executionId, total: cartCheck.total, currency: cfg.currency, budgetStatus: cartCheck.budget_status, itemCount: cart.length }) });
say("WhatsAppNotification", "Send", wa.status, wa.detail, wa.status === "FAILED" ? "ERROR" : "INFO");

const summary: ShoppingSummary = {
  execution_id: executionId,
  executed_at: new Date().toISOString(),
  address: { expected: cfg.delivery_address.label, displayed: cfg.delivery_address.label, status: addr.status },
  selections: [],
  cart,
  subtotal: cartCheck.subtotal,
  charges: { delivery: null, discount: null, other: null },
  total: cartCheck.total,
  budget: cfg.budget,
  currency: cfg.currency,
  budget_status: cartCheck.budget_status,
  overrun: cartCheck.overrun,
  unavailable,
  substitutions,
  overall_status: cartCheck.overall,
  email_notification: email.status,
  whatsapp_notification: wa.status,
  warnings: [...warnings, ...cartCheck.notes],
  errors,
  order_placed: false,
  payment_initiated: false
};

mkdirSync(cfg.runtime.output_dir, { recursive: true });
writeFileSync(`${cfg.runtime.output_dir}/shopping_summary.json`, JSON.stringify(summary, null, 2));
writeFileSync(`${cfg.runtime.output_dir}/shopping_summary.html`, summaryToHtml(summary));
appendLogCsv(`${cfg.runtime.output_dir}/execution_log.csv`, logs);
writeFileSync(`${cfg.runtime.output_dir}/execution_report.txt`, finalReport(summary));
console.log(`Sample run complete: ${executionId} overall=${summary.overall_status} total=${summary.total} (mock data, test_mode — no order, no sends)`);
