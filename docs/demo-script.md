# Demo script — 3–5 min recording (+ 14 screenshots)

Covers spec §16. Record in **test_mode first**. Hide passwords/OTPs/tokens; blur any personal address beyond its label.

| # | Time | Show | Screenshot file |
|---|---|---|---|
| 1 | 0:00 | Project structure in Explorer + `config.example.json` (sample data) | `01-structure.png`, `02-config.png` |
| 2 | 0:30 | PAD Console: Main flow + 4 subflows (scroll each) | `03-main-flow.png`, `04-subflows.png` |
| 3 | 1:10 | Run in test_mode; Blinkit address verification (expected vs displayed) | `05-address.png` |
| 4 | 1:50 | Product search + comparison (brand/size/price on screen) | `06-compare.png` |
| 5 | 2:20 | Cart with quantities + totals; budget check on screen | `07-cart.png`, `08-quantities.png`, `09-budget.png` |
| 6 | 3:00 | Open `outputs/shopping_summary.html` + `.json` | `10-summary.png` |
| 7 | 3:20 | Gmail draft/log (or inbox if live) + WhatsApp log/manual-fallback | `11-gmail.png`, `12-whatsapp.png` |
| 8 | 3:40 | `execution_log.csv` + final report; narrate subflows/error handling | `13-logs.png` |
| 9 | 4:20 | Final cart tab: **no checkout button clicked, no payment** — end card | `14-final.png` |

Narration must state: what was mock vs live, that the run stopped at the verified cart, and that notifications were/weren't actually delivered.
Save MP4 as `recording/demo.mp4` (gitignored if large — share via Drive link instead).
