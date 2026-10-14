import { describe, expect, it } from "vitest";
import { normalizeLabel, verifyAddress } from "../src/shopping/verifyAddress.js";

describe("verifyAddress", () => {
  it("passes on exact match", () => {
    expect(verifyAddress("Home", "Home").status).toBe("PASS");
  });
  it("is case/space-insensitive", () => {
    expect(normalizeLabel("  My  Home ")).toBe("my home");
    expect(verifyAddress("My Home", "my  home").status).toBe("PASS");
  });
  it("fails on mismatch and demands stop", () => {
    const r = verifyAddress("Home", "Office");
    expect(r.status).toBe("FAIL");
    expect(r.detail).toMatch(/must stop/i);
  });
  it("fails (never assumes) when display is missing", () => {
    expect(verifyAddress("Home", null).status).toBe("FAIL");
    expect(verifyAddress("Home", "   ").status).toBe("FAIL");
  });
});
