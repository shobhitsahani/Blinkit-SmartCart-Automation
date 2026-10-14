# PAD setup, limitations & honest fallbacks

## Environment (verified this machine)
- OS: Windows (win32), Node v24.14.0, npm 11.9.0, global tsc 7.0.2.
- PAD: Microsoft.PowerAutomateDesktop 1.0.2141.0 installed.
- Browser: use Edge + the Microsoft Power Automate browser extension (you must install/enable it; browsing Blinkit was not performed in this session).

## Gmail (EmailNotification)
- Supported path: PAD **Outlook / Gmail connector action** with your own authorized connection, or an approved SMTP sender you own. Setup is manual: create the connection in PAD/C-power-automate, approve OAuth, test-send to yourself.
- Test_mode: the flow drafts the message and logs `SKIPPED — drafted, NOT sent`. This is the default and the only path exercised in this repo.
- Limitation: this repo never sends email by itself (`sendEmail` returns SKIPPED/FAILED honestly). Do not claim delivery without the PAD run log + inbox evidence.

## WhatsApp (WhatsAppNotification)
- Only compliant path: **WhatsApp Business Platform** (business account, recipient opt-in, approved template, per-message cost) or another explicitly supported connector in your PAD version.
- Personal WhatsApp accounts have **no supported auto-send**; unofficial browser-scraping/automation is prohibited by the assignment and platform rules.
- Fallback (documented, honest): in test_mode or when unconfigured, the flow logs `SKIPPED/UNSUPPORTED` + the exact message text, and you send it manually from your own phone to the approved test recipient, labeling the screenshot `manual-fallback`. Never present a manual send as automatic.
- This repo's `sendWhatsApp` returns `UNSUPPORTED` in exactly this case — that is a correct, passing behavior.

## Blinkit browser automation
- Selectors change: re-capture address/search/product/Add/cart elements with the PAD recorder on your build and record them in `pad-flows/subflows.inventory.json`.
- CAPTCHA/OTP/rate-limit/bot-block: the flow must `Display message` + pause for you to solve manually. Bypassing is forbidden and a safe-stop trigger.
- Login: only your own authorized account; session reuse preferred over scripting credentials (never in flow files or config).

## What was NOT done here (Phase 2, you)
Live Blinkit run, real sends, native `.pad` exports, real screenshots/recording. See `docs/demo-script.md`.
