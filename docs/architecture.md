# Architecture — Blinkit SmartCart Automation

## 1. Stack
- **Primary automation: Microsoft Power Automate Desktop (PAD)** — browser interactions with Blinkit, reusable subflows, orchestration. Installed: v1.0.2141.0 (this machine).
- **Supporting code: TypeScript / Node.js (strict) + Zod** — config validation, pure shopping safety logic (address verify, product compare, cart/budget validate, STOP-guard), report generation (JSON/HTML/CSV), structured logging. Per user requirement 2026-10-13, all code is TS. This replaces the spec's suggested Python/PowerShell helpers with equivalent TS modules (same responsibilities, `npm run` entry points).
- **Tests: Vitest** — unit tests on fixtures only. No live Blinkit/Gmail/WhatsApp calls in tests.
- **Data: JSON config + JSON/HTML/CSV outputs.** No secrets in config; secrets via env (`.env.example` only).
- **Playwright: supporting-only, not used in Phase 1.** PAD is never replaced by a standalone framework.

## 2. Folder structure
```
Blinkit-SmartCart-Automation/
├── README.md                  # setup, run, safety, limitations
├── config.example.json        # sample grocery config (no secrets)
├── .env.example               # BLINKIT_ADDRESS, BUDGET_LIMIT, GMAIL_*, WHATSAPP_* placeholders
├── package.json / tsconfig.json / vitest.config.ts
├── GOAL.md / GUIDE.md
├── src/
│   ├── types.ts               # shared interfaces + status literals
│   ├── config/                # config.schema.ts (Zod), loader.ts
│   ├── shopping/              # verifyAddress.ts, compareProducts.ts, validateCart.ts, cartGuard.ts
│   ├── integrations/          # gmail.ts, whatsapp.ts (authorized-only, NOT_CONFIGURED-honest)
│   ├── errors/                # AutomationError.ts, classifier.ts, retry.ts
│   ├── reports/               # summary.ts (JSON+HTML), executionLog.ts (CSV), finalReport.ts (TXT)
│   └── logging/logger.ts      # structured JSON logger
├── tests/                     # *.test.ts, fixtures/, test_cases.md, test_results.md, sample_config.json
├── pad-flows/                 # README.md + subflows.inventory.json (NO fake .pad exports)
├── docs/                      # architecture.md, pad-setup-limitations.md, demo-script.md, known_limitations.md
├── outputs/                   # generated samples (.gitkeep + gitignored artifacts)
├── screenshots/ / recording/  # .gitkeep + capture plan only (no faked media)
└── structure.png.png          # Excalidraw-style whiteboard (prior session)
```

## 3. Module responsibilities
| Module | Owns | Must NOT do |
|---|---|---|
| `src/config` | Load + Zod-validate grocery list, budget, address label, recipients, test_mode, logging/screenshot prefs | Store/accept passwords, tokens, API keys |
| `src/shopping/verifyAddress` | Compare Blinkit-displayed address vs expected label; return VERIFIED/FAILED | Assume click == selected; proceed on ambiguity |
| `src/shopping/compareProducts` | Deterministic pick: reject constraint violations → prefer brand → compare equal sizes → price-per-unit → best value → substitute only if allowed; record rationale | Compare by price across sizes; invent missing size/price; silent unrelated substitution |
| `src/shopping/validateCart` | Verify identity/brand/size/req-vs-actual qty/unit-price/line-total; subtotal/charges/discounts/final from verified display; budget PASS/FAIL/NOT_VERIFIED + overrun | Invent charges; claim PASS on unverified total; auto qty-cut unless configured |
| `src/shopping/cartGuard` | Enforce STOP-before-order: assert no checkout/order/pay action in planned steps | Contain any checkout code path |
| `src/integrations/gmail` | Build subject/body from summary; send only via authorized configured sender; return SENT/FAILED/SKIPPED + log | Send without config; claim success pre-result |
| `src/integrations/whatsapp` | Concise message; official/supported channel only; return SENT/FAILED/UNSUPPORTED + manual-fallback note | Unofficial automation; personal-account auto-send claims |
| `src/errors` | Typed `AutomationError` (category, retryable, safeToContinue), classifier, bounded retry (transient only) | Retry address/cart/safety failures |
| `src/reports` | JSON + HTML summary, CSV log rows, TXT final report; explicit no-order/no-payment confirmation | Report success when critical validation failed |
| `src/logging` | Timestamped structured entries (execId, flow, op, status, category, message); no secrets | Log creds/tokens/PII excess |

## 4. Data flow
```
config.example.json → validate (Zod) → verifyAddress (gate: FAILED stops all shopping)
  → per item: search → compareProducts (eligible + rationale)
  → cart operations → validateCart (qty/prices/totals + budget)
  → cartGuard (STOP before order/pay) → summary (JSON+HTML) + logs (CSV) + final report (TXT)
  → gmail + whatsapp (independent; failure never deletes summary)
  → ErrorHandling on any failure (typed category, bounded retry, safe-stop)
```
Line styles (whiteboard): solid = normal data, dashed = error handling, dotted = optional/manual.

## 5. PAD subflows (physical creation is manual — see `pad-flows/README.md`)
1. **BlinkitShoppingAssistant** (Main): init vars → load/validate config → exec ID + output dir → invoke ShoppingProcess → generate reports → invoke Email/WhatsApp → record outcomes → finalize. No browser selectors here.
2. **ShoppingProcess**: launch/attach Edge → blinkit.com → authorized auth only → set + verify address (gate) → per-item search/extract/compare/add → cart + budget verify → return structured results.
3. **EmailNotification**: in (summary, recipient, test_mode) → subject/body → send via approved Gmail connection → out (status). Test mode = draft/log only option.
4. **WhatsAppNotification**: in (summary, recipient, test_mode) → concise text → supported channel only → out (SENT/FAILED/UNSUPPORTED + fallback note).
5. **ErrorHandling**: in (op, error, context) → timestamp + screenshot-if-permitted → classify → bounded retry transient-only → safe-stop on address/cart/safety → out (structured failure).

## 6. Phased plan
**Day 1 (this session):** architecture (here) → TS scaffold + config/logging/errors → shopping safety logic → integrations + reports → Vitest suite → pad-flows inventory (documented, no fake exports) → README + setup/limitations/demo docs → `npm install`, `tsc --noEmit`, `vitest run` green → sample `outputs/` from test_mode fixtures → test_cases + test_results with real evidence.
**Day 2 (user, manual):** install PAD Edge extension → create the 5 flows per `pad-flows/README.md` → configure address/recipients/test_mode → run in test_mode → capture screenshots + 3–5 min recording → export flows via PAD supported export → place exports under `pad-flows/exports/` → share package link.
