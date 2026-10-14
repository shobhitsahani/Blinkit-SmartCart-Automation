# Blinkit storefront reconnaissance — read-only, 2026-10-13

Method: fetched `https://blinkit.com/`, `/s/?q=milk`, `/llms.txt` over plain HTTP.
No session, no login, no cart interaction, nothing clicked. Findings inform PAD
selector capture; every selector below MUST be re-captured with the PAD recorder
on the user's build before use.

## Confirmed URL patterns
- Search entry: `/s/` (header search button links there).
- Search action (from JSON-LD `SearchAction`): `https://blinkit.com/s/?q={search_term}`.

## Header components (React + styled-components 5.3.5)
Semantic prefixes are stable; the `sc-*` hash suffix changes per deploy, so use
partial/contains matching in PAD, never the full generated class.

| UI target | Marker (contains-match) | Notes |
|---|---|---|
| Address selector | `LocationBar__Container` | Subtitle `LocationBar__Subtitle` shows current text (`Select Location` when unset); arrow `LocationBar__DownArrow`. Verify by reading subtitle text, not by click alone. |
| Search entry | `SearchBar__Button` → `/s/` | Animated placeholders include "milk", "bread". |
| Search input (on `/s/`) | `SearchBarContainer__Input` | Real `<input>` element. |
| Login entry | `ProfileButton__Container`, text `Login` | Opens login dialog; OTP is manual (see below). |
| Cart button | `CartButton__Container` / `CartButton__Button` | `disabled` attribute present while cart empty; text `My Cart`. |
| Logo/home | `BlinkitLogo__LogoContainer` href `/` | Safe navigation anchor. |

## Rendering behavior (reliability impact)
- Feed and search results render client-side behind skeleton loaders
  (`BffSearchMobile__Skeleton*`, `Feed__LoaderContainer`). PAD must **wait for
  product elements**, never fixed delays.
- Empty-cart state is explicit (`disabled` cart button) — use it as a precondition check.

## Official agent recipe (`/llms.txt`, fetched in full)
Blinkit publishes a "Shopping agent recipe" describing page agent tools
(`get_session`, `request_otp`/`submit_otp`, `list_saved_addresses`,
`set_delivery_address`, `search_products`, `set_cart_items`, `get_cart`,
`proceed_to_checkout`, …) with session tiers (`needs_location`/`exploring`/
`ordering`) and rules: totals only from latest tool result, OTP via the shopper,
address ambiguity resolved by `address_id`, rate-limit backoff.
**Out of scope for this assignment** (requires a live page session + the
shopper's phone/OTP, and the assignment mandates PAD browser automation ending
before checkout). Referenced here because it independently confirms our safety
architecture: verified address gate, verified-bill comparison, manual OTP,
no memory-quoted totals.

## What was NOT done
No login, no address change, no search submitted in a session, no cart touched.
Product/price data in this repo remains labeled mock fixtures.
