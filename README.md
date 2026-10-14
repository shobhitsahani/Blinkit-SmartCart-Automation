# Blinkit SmartCart Automation

PAD-first RPA internship assignment: automate grocery shopping **up to the verified cart** — quantities + budget checked, summary generated, Gmail/WhatsApp demonstrated — and **stop before any order or payment**.

> Safety: no Place-Order/pay automation exists in this repo. Test_mode uses mock data; nothing is purchased or sent. See `docs/known_limitations.md`.

## Architecture
`docs/architecture.md` + whiteboard `structure.png.png`. Main flow `BlinkitShoppingAssistant` orchestrates 4 subflows (`ShoppingProcess`, `EmailNotification`, `WhatsAppNotification`, `ErrorHandling`); TS modules validate config, enforce address/cart/budget gates, and generate reports. PAD does all browser work; TS never replaces it.

## Requirements
- Windows + Power Automate Desktop (v11.2609.183.0 / v1.0.2141.0) + Google Chrome (project browser) with Microsoft Power Automate extension installed & enabled on `blinkit.com`.
- Node 24 + npm (verified: 24.14.0 / 11.9.0). Install: `npm install`.

## Configure
1. Copy `config.example.json` → `config.json` (gitignored; keep example committed). Edit items (name/qty/unit/brand/size/max-price), `budget`, `delivery_address.label` (approved label only), `preferences` (strategy, substitution/qty-adjust flags), `notifications` (recipients = approved test addresses only, `test_mode: true` first), `runtime` (output dir, retries ≤5, timeouts).
2. Copy `.env.example` → `.env` for any future live sender IDs (never commit `.env`). No passwords/tokens in config or flows.
3. Validate: `npm run validate-config -- config.json` (or `npx tsx src/config/loader.ts config.json`).

## PAD flows
The 5 flows are authored as verified Robin script specifications in [`pad-flows/exports/`](file:///c:/project_assigments/Blinkit-SmartCart-Automation/pad-flows/exports/):
- Create the flows in PAD Designer following [`pad-flows/README.md`](file:///c:/project_assigments/Blinkit-SmartCart-Automation/pad-flows/README.md).
- Logic actions can be pasted via clipboard (<kbd>Ctrl+V</kbd>) into the PAD Designer canvas.
- Web automation selectors (`appmask`) for Blinkit (address subtitle, search box, product cards, Add buttons, cart drawer) must be captured live using the PAD Web Recorder in Google Chrome.

## Run (safe test_mode)
- `npm run gen-summary` → writes `outputs/shopping_summary.json/.html`, `execution_log.csv`, `execution_report.txt` from **labeled mock data** (proves the pipeline; real Blinkit data only from your PAD run).
- `npm test` → Vitest suite (fixtures only, no live calls).
- `npm run doctor` → Readiness gate checking prerequisites and blockers.

## Inspect reports
Open `outputs/shopping_summary.html` (cart table, totals, budget badge, no-order statement), `.json` (machine-readable), `execution_log.csv` (timestamped ops), `execution_report.txt` (final status + overrun + notification outcomes).

## Tests
`tests/test_cases.md` (10 required scenarios) + `tests/test_results.md` (real outcomes from this machine). Failure scenarios use mocks; never manipulate a real cart toward purchase.

## Gmail / WhatsApp
Authorized setup only — see `docs/pad-setup-limitations.md`. Default test_mode drafts + logs `SKIPPED`; unconfigured WhatsApp reports `UNSUPPORTED` + manual fallback. Never claim delivery without PAD logs + inbox/message evidence.

## Limitations / Security
`docs/known_limitations.md` (no live run/sends/exports/media in repo) and `docs/pad-setup-limitations.md`. Never commit `.env`, real recipients beyond test placeholders, OTPs, or tokens. Pause for manual CAPTCHA/OTP; stop on address/cart/safety failure.

## Submission
Docs + code + `outputs/` samples + `tests/` evidence are ready. You add: 5 PAD exports, 14 screenshots, `recording/demo.mp4` (per `docs/demo-script.md`), then share the Drive link.
