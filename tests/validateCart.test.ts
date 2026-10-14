import { describe, expect, it } from "vitest";
import { validateCart } from "../src/shopping/validateCart.js";
import { goodCart } from "./fixtures.js";
import type { CartLine } from "../src/types.js";

describe("validateCart", () => {
  it("passes a verified cart within budget", () => {
    const r = validateCart(goodCart, 500, false);
    expect(r.overall).toBe("PASS");
    expect(r.total).toBe(70);
    expect(r.budget_status).toBe("PASS");
  });
  it("fails budget with overrun recorded, never checkout", () => {
    const r = validateCart(goodCart, 50, false);
    expect(r.budget_status).toBe("FAIL");
    expect(r.overrun).toBe(20);
    expect(r.overall).toBe("FAIL");
  });
  it("marks NOT_VERIFIED (never PASS) on null prices", () => {
    const lines: CartLine[] = [{ product: "Milk", brand: null, pack_size: null, requested_qty: 1, actual_qty: 1, unit_price: null, line_total: null, verified: false }];
    const r = validateCart(lines, 500, false);
    expect(r.overall).toBe("NOT_VERIFIED");
    expect(r.budget_status).toBe("NOT_VERIFIED");
  });
  it("fails qty mismatch when adjustment not allowed", () => {
    const lines: CartLine[] = [{ ...goodCart[0]!, actual_qty: 2, line_total: 60 }];
    const r = validateCart(lines, 500, false);
    expect(r.overall).toBe("FAIL");
  });
  it("warns (not fail) on mismatch when adjustment allowed", () => {
    const lines: CartLine[] = [{ ...goodCart[0]!, actual_qty: 2, line_total: 60 }];
    const r = validateCart(lines, 500, true);
    expect(r.overall).toBe("WARNING");
  });
});
