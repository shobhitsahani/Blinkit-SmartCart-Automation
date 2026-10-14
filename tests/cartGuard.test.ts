import { describe, expect, it } from "vitest";
import { assertNoPurchaseStep } from "../src/shopping/cartGuard.js";

describe("cartGuard", () => {
  it("allows safe verified-cart plans", () => {
    expect(() => assertNoPurchaseStep(["Open Blinkit", "Verify cart", "Generate summary"])).not.toThrow();
  });
  it("blocks place-order variants", () => {
    for (const step of ["Click Place Order", "Order Now button", "Confirm Purchase", "Pay Now", "Make Payment", "Proceed to Checkout"]) {
      expect(() => assertNoPurchaseStep([step])).toThrow(/SAFETY BLOCK/i);
    }
  });
});
