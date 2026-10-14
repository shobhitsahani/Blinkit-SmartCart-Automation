# Test cases (spec §12) — repeatable, mocks for failures, no real purchases

Statuses: `PASS` `FAIL` `WARNING` `SKIPPED` `NOT_VERIFIED`. Automated cases run via
`npm test`; browser/notification-live cases are manual (Phase 2) with expected outcomes below.

| # | Scenario | Steps | Expected |
|---|---|---|---|
| T1 | Successful shopping workflow | `npm test` (validateCart PASS case) + `npm run gen-summary` | Cart verified, budget PASS, summary + logs generated, no order |
| T2 | Product unavailable | `npm test` (compareProducts unavailable/substitute-refused cases) | Item recorded unavailable, others continue, error logged |
| T3 | Budget exceeded | `npm test` (budget FAIL case: total 70 vs 50) | Budget FAIL + overrun 20, no checkout, reported |
| T4 | Address verification failure | `npm test` (verifyAddress mismatch/null cases) | FAIL, shopping stops, nothing added |
| T5 | Quantity mismatch | `npm test` (mismatch FAIL / WARNING cases) | FAIL when adjustment disallowed; WARNING when allowed |
| T6 | Price/total unverified | `npm test` (null-price case) | Overall + budget NOT_VERIFIED, never PASS |
| T7 | Gmail failure | `npm test` (sendEmail SKIPPED/FAILED cases) + sample run log | Summary kept; failure recorded separately |
| T8 | WhatsApp unavailable | `npm test` (UNSUPPORTED case) | Limitation logged + manual fallback; no delivery claim |
| T9 | Invalid configuration | `npm test` (config suite) + `npm run validate-config` on bad file | Fail fast before browser; clear field errors |
| T10 | No-purchase safety | `npm test` (cartGuard blocks 6 forbidden variants) + sample run output | Verified cart is final state; no order/payment strings in plan |
| T11 | Manual Phase 2 (user) | PAD test_mode run per `pad-flows/README.md` + `docs/demo-script.md` | Screenshots 01–14 + demo.mp4; exports in `pad-flows/exports/` |

Run failure-scenario mocks with fixtures in `tests/fixtures.ts` (never a real cart).
