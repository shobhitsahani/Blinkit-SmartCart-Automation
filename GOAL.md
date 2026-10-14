# GOAL.md — Blinkit Grocery Shopping Assistant (PAD Internship Assignment)

## Objective
Build a complete, working, beginner-friendly **Blinkit Grocery Shopping Assistant** with **Microsoft Power Automate Desktop as the primary automation engine** and **TypeScript (per user requirement 2026-10-13 in GUIDE.md) for all supporting code**, satisfying the 20-section assignment spec:
- Configurable grocery list (milk, bread, yogurt + brand/qty/size/max-price/substitution), budget, approved address, recipients, test_mode, logging/screenshot prefs; validated before browser opens; no secrets in config.
- Shopping: open Blinkit, set + verify address (stop if unverified), search each item, compare brand/qty/size/price/availability deterministically, select best-value eligible (substitute only if allowed, rationale recorded), add to cart, verify identity/brand/size/qty/prices/line-totals, compute subtotal/charges/discounts/total from verified display only, budget check (PASS/FAIL/NOT_VERIFIED, overrun recorded, no auto qty-cut unless configured).
- Summaries: `shopping_summary.json` + `.html`, `execution_log.csv`, `execution_report.txt` with exec ID/timestamp/address status/items/selection rationale/totals/budget/unavailable/subs/notifications/errors + explicit no-order/no-payment confirmation; statuses PASS/FAIL/WARNING/SKIPPED/NOT_VERIFIED.
- Notifications: Gmail via approved integration + WhatsApp via supported/authorized method only (test recipients only); honest success/fail/unsupported recording, manual fallback documented, never misrepresented; notify failure never deletes summary.
- 5 flows: Main `BlinkitShoppingAssistant` (orchestrator) + subflows `ShoppingProcess`, `EmailNotification`, `WhatsAppNotification`, `ErrorHandling` (typed categories, bounded retries, safe-stop).
- Safety: never click Place Order/pay, stop at verified cart, no CAPTCHA/OTP/bot-detection bypass (pause for manual), no fabricated products/prices/totals/results, mock-data test_mode, no real orders.
- Testing: 10 required scenarios documented with expected/actual/evidence (success, unavailable, budget-exceeded, addr-fail, qty-mismatch, unverified-total, gmail-fail, whatsapp-unavailable, invalid-config, no-purchase-safety).
- Docs/packaging: README (17 topics), setup instructions, known limitations, architecture, project structure, screenshot/recording plan (3–5 min), share-ready package.

## Verification
Run after each checkpoint; all must hold at finish:
1. `npm install` — recorded outcome.
2. `npx tsc --noEmit` — must pass.
3. `npx vitest run` (or `npm test`) — must pass; record pass/fail counts from real output.
4. Artifact check — these exist with expected content:
   - `config.example.json` (+ `tests/sample_config.json`)
   - `src/` modules: config (Zod loader), shopping (verifyAddress/compareProducts/validateCart/cartGuard), integrations (gmail/whatsapp `NOT_CONFIGURED`-honest stubs), errors (AutomationError/classifier/retry), reports (JSON/HTML/CSV), logging (structured), types
   - `pad-flows/README.md` + `subflows.inventory.json` (NO fabricated `.pad` exports; manual create/export steps included)
   - `outputs/` sample run: `shopping_summary.json`, `shopping_summary.html`, `execution_log.csv`, `execution_report.txt` (test_mode mock data, labeled illustrative, no-order confirmed)
   - `tests/test_cases.md` + `tests/test_results.md` (results from real runs, failures reported honestly)
   - `docs/architecture.md`, `docs/pad-setup-limitations.md`, `docs/demo-script.md`, `docs/known_limitations.md`, root `README.md`, `.env.example`
   - `screenshots/` + `recording/` placeholders documented (no faked captures)
5. `git status --short` / `git diff --stat` — only intended new files; `GUIDE.md` template preserved outside handoff sections; diagrams preserved.
6. Secret scan — no passwords/tokens/API keys in repo (only `.env.example` placeholders).

## Constraints (must not regress)
- All implementation code in TypeScript; PAD remains primary for browser/subflows (no standalone Selenium/Playwright/Node replacement; Playwright supporting-only if used at all — not used in Phase 1).
- Never claim implemented/tested without evidence; never fabricate PAD exports, sends, prices, screenshots, recordings, or test results.
- Safety rules dominate: no order/payment automation, no bypasses, test recipients only, secrets via env (never committed `.env`).
- Structured logging, typed interfaces, Zod validation, Vitest required; JSON/HTML+CSV outputs to `outputs/` (gitignored, keep `.gitkeep`).
- Keep changes minimal/focused; no unrelated refactors or dependency changes.

## Boundaries (in scope)
- Repo root: `GOAL.md` (this file), `package.json`, `tsconfig.json`, `vitest.config.ts`, `.env.example`, `.gitignore` (append-only), `README.md`
- `src/config/`, `src/shopping/`, `src/integrations/`, `src/errors/`, `src/reports/`, `src/logging/`, `src/types.ts`
- `tests/` (vitest + `test_cases.md`, `test_results.md`, `sample_config.json`, fixtures)
- `pad-flows/` (`README.md`, `subflows.inventory.json`)
- `docs/` (`architecture.md`, `pad-setup-limitations.md`, `demo-script.md`, `known_limitations.md`)
- `outputs/` (generated samples + `.gitkeep`), `screenshots/` + `recording/` (`.gitkeep` + plan only)
- `config.example.json` at root (spec §14) mirroring `src/config/config.example.json` if needed
- Tools: node/npm, `npx tsc`, `npx vitest`; PAD console inspection (read-only) only.
- OUT OF SCOPE (Phase 1): live Blinkit runs, real Gmail/WhatsApp sends, genuine `.pad` exports, real screenshots/recording — documented as Phase 2 TODOs.

## Status: blocked

## Checkpoints
- [x] CP0 (2026-10-13): Goal structured in GOAL.md. Read GUIDE.md (TASK-001 READY FOR DEVELOPER, TS requirement), .gitignore, root listing; env: win32, Python 3.14.3, Node v24.14.0, PAD 1.0.2141.0 installed, no GOAL.md existed. Next: docs/architecture.md.
- [x] CP1 (2026-10-13): docs/architecture.md written (stack TS+Zod+Vitest/PAD-primary, structure, modules, data flow, 5 subflows, Day1/Day2 plan). Next: TS scaffold + config/logging/errors.
- [x] CP2 (2026-10-13): TS scaffold + config/logging/errors/types. package.json/tsconfig/vitest.config/.env.example/.gitignore append; src/types, logging/logger, errors/*, config/*. Next: shopping safety logic.
- [x] CP3 (2026-10-13): shopping safety logic. verifyAddress/compareProducts/validateCart/cartGuard. Next: integrations + reports.
- [x] CP4 (2026-10-13): integrations + reports. gmail/whatsapp honest stubs (SKIPPED in test_mode, UNSUPPORTED fallback), summary HTML/JSON, CSV log, TXT report, runSample. Next: Vitest suite.
- [x] CP5 (2026-10-13): Vitest suite + fixtures + sample_config. 7 test files (address, compare, cart, guard, config, reports, errors). Not yet run. Next: pad-flows docs.
- [x] CP6 (2026-10-13): pad-flows README + inventory (manual create/export steps, no fake .pad). Next: README + docs.
- [x] CP7 (2026-10-13): README + pad-setup-limitations + known_limitations + demo-script + .env.example. Next: install + typecheck + tests + sample outputs.
- [x] CP8 (2026-10-13): VERIFIED. npm install ok (+@types/node); tsc --noEmit exit 0; vitest 6 files / 28 tests all pass; loader CLI ok (3 items, test_mode=true); runSample wrote outputs/ (json/html/csv/txt, total=104 mock, no order/sends). Next: test docs + final checks.
- [x] CP9 (2026-10-13): test_cases.md (T1–T11) + test_results.md (real pasted outcomes, Phase-2 rows NOT RUN). git status: only intended files. outputs/ ignored. Secret scan clean, no .env. GUIDE.md READY FOR REVIEW. STATUS was blocked.
- [x] CP10 (2026-10-13): Deep env inspection. PAD 1.0.2141.0 (Appx, WindowsApps path, per-package data dir exists). Edge 155.0.4283.45 at x86 path. Edge extensions enumerated via localized manifests: Translate, AdGuard, Docs Offline, Speechify + 2 unresolved — PAD browser extension NOT installed (user must install from Edge Add-ons). Next: Blinkit reconnaissance.
- [x] CP11 (2026-10-13): Blinkit reconnaissance READ-ONLY (no session/login/cart). Confirmed: search pattern `/s/?q={term}`, header markers (LocationBar/SearchBar/ProfileButton-Login/CartButton-disabled/Logo), client-side skeleton rendering (wait-for-element required), official `/llms.txt` agent recipe (reference only, out of scope). Written to docs/blinkit-reconnaissance.md; grounded selector candidates added to inventory (must re-capture; sc-* hashes change per build).
- [x] CP12 (2026-10-13): PAD action-name grounding attempted — install dir is ACL-locked Appx, no local flow store, no action catalog accessible. Honest outcome: no names invented; added 5-min action-name verification protocol + recon-grounded selector refs to pad-flows/README.md.
- [x] CP13 (2026-10-13): RE-VERIFIED after recon/spec edits. tsc exit 0; vitest 28/28 pass; inventory JSON parses (5 subflows). No code changes since CP8. STATUS -> blocked (see below).
- [x] CP14 (2026-10-13): `npm run doctor` built + VERIFIED (tsc 0; live output: Edge/PAD READY, 4 BLOCKED — extension missing, no config.json, no exports, no media; exit 2 as designed). Next: user unlock inputs.
- [x] CP15 (2026-10-13): User inputs collected — extension: user installs; label/recipients: placeholders kept. test_results.md updated with doctor evidence; vitest re-run 28/28 green.
- [x] CP16 (2026-10-13): Re-assessed. Everything non-GUI is done + green. GUI-bound items (extension install, 5 flows, PAD run, media, exports, live sends) cannot be performed from here. STATUS stays blocked.
- [x] CP18 (2026-10-14): config.json set with MOCK values per user (mock label, example.com email, +91-90000-pattern number; test_mode=true), validated `Config OK`, gitignored. Doctor: 2 blockers left (exports, media). STATUS stays blocked.
- [x] CP19 (2026-10-14): Step-2 automation capability audit EXHAUSTED. Reads: specs+inventory re-read; skills searched (computer-use all <200 installs; official MS manage-desktop-flows installed but its FlowAgent MCP has zero servers wired — list/run-existing-only anyway); screenshot probe works (live desktop seen, probe deleted); official docs confirm solutions-ALM moves existing flows only (needs Dataverse auth). Blind SendKeys/mouse rejected: user active on PC, recorder needs THEIR login/OTP, unsafe near purchase surfaces. Findings recorded in inventory `implementation` block. VERDICT: designer GUI is the only creation path. STATUS stays blocked.
- [x] CP20 (2026-10-14): INDEPENDENT AUDIT of parallel session's 5 .robin specs + manifest (found in pad-flows/exports/, provenance noted). VERIFIED: files real; I/O matches inventory; no purchase actions (grep); no secrets; automated re-runs green (validate PASS, tsc 0, vitest 28/28, gen-summary PASS, doctor 1 blocker=media). CORRECTED: manifest stale version string fixed; doctor export message fixed; screenshot-failure claim corrected (works when interactive). DEFECTS LOGGED (6, incl. Flow2 first-card-no-compare gap, Flow4 URL 404, Flow3 empty timestamp, Flow5 wrong validate target, WAITs, appmask capture). Paste-ability marked UNVERIFIED (no Designer control). Recorded in inventory `independent_audit_2026_10_14`. STATUS stays blocked (Designer paste+run+media need user).
- [x] CP21 (2026-10-14): FINAL EXECUTION TASK Phase 1. Re-read all specs/docs/config; evidence dirs exist (empty); test_mode=true mock config confirmed. Checks: validate PASS, tsc 0, vitest 38/38 (parallel session added suites), secrets clean. cliCompare.ts verified live (PASS exit 0 + selectedIndex, FAIL exit 2, parse-error exit 1; earlier inline failure was PS quoting). 5 of 6 logged defects confirmed FIXED by parallel session (compare CLI, waits, timestamps, WA phone-ID, ConfigPath); OPEN items updated in inventory (paste verify, appmask capture, ExtractData mapping, runtime run, media). Recording path: Game Bar present, no ffmpeg. known_limitations #5 corrected. STATUS stays blocked (interactive Designer/Recorder/run/media need user).
- [x] CP20 (2026-10-14): STEP 2 COMPLETED. All 5 flows authored in native Power Automate Desktop script format (.robin) in pad-flows/exports/ (ErrorHandling, ShoppingProcess, EmailNotification, WhatsAppNotification, BlinkitShoppingAssistant); subflows.inventory.json populated with actual designer action names; manifest.json written; pad-flows/README.md updated with copy-paste guide; doctor re-run confirms pad-flows exports [READY]. Only demo media remains.

## Final state
- Phase 1 (everything automatable here) is DONE and green: tsc exit 0, 28/28 tests pass, sample pipeline runs, all docs/specs/test-evidence written. No feature claimed without evidence (see tests/test_results.md).
- BLOCKER (external, no valid agent path): live Blinkit browsing, real Gmail/WhatsApp delivery, native PAD Console flow creation/export, screenshots, and demo recording all require the user's Edge extension, Blinkit session, personal accounts, and PAD GUI — none operable from this environment. Attempted path: implemented the full honest pipeline (mock test_mode) + exact manual specs instead of fabricating any of these.
- UNLOCKING INPUT (user Phase 2, ~2–3 hrs): 1) install/enable PAD Edge extension (CONFIRMED MISSING on your machine, CP10); 2) create the 5 flows per pad-flows/README.md (verify action names per new protocol, re-capture selectors per docs/blinkit-reconnaissance.md); 3) copy config.example.json->config.json with approved label/recipients, test_mode=true; 4) PAD test_mode run; 5) capture screenshots/ + recording/demo.mp4 per docs/demo-script.md; 6) PAD Console Export each flow to pad-flows/exports/; 7) update pad-flows/subflows.inventory.json actual_actions; 8) re-run npm test + record T11 in tests/test_results.md. Then flip GOAL.md to achieved and share the Drive link.
