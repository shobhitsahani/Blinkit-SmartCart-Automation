import { describe, expect, it } from "vitest";
import { compareProducts } from "../src/shopping/compareProducts.js";
import { runCliCompare } from "../src/shopping/cliCompare.js";
import { breadBranded, milkCandidates, milkItem, priceCapped } from "./fixtures.js";
import type { GroceryItem, ProductCandidate } from "../src/types.js";

describe("compareProducts", () => {
  it("picks cheapest eligible when no brand preference (multiple candidates)", () => {
    const r = compareProducts(milkItem, milkCandidates, false);
    expect(r.status).toBe("PASS");
    expect(r.selected).toBe("Mother Dairy Milk 500ml");
    expect(r.unit_price).toBe(29);
    expect(r.substituted).toBe(false);
    expect(r.rationale).toMatch(/cheapest|best value/i);
  });

  it("selects preferred brand when multiple brands are present", () => {
    const itemWithBrand: GroceryItem = {
      name: "milk",
      quantity: 1,
      unit: "pack",
      preferred_brand: "Amul",
      minimum_size: "500ml",
      maximum_price: 50
    };
    const r = compareProducts(itemWithBrand, milkCandidates, false);
    expect(r.status).toBe("PASS");
    expect(r.selected).toBe("Amul Taaza Milk 500ml");
    expect(r.brand).toBe("Amul");
    expect(r.unit_price).toBe(30);
    expect(r.substituted).toBe(false);
  });

  it("matches pack size strictly and filters out non-matching sizes", () => {
    const itemWithMinSize: GroceryItem = {
      name: "milk",
      quantity: 1,
      unit: "pack",
      preferred_brand: null,
      minimum_size: "1L",
      maximum_price: 100
    };
    const candidates: ProductCandidate[] = [
      { name: "Small Milk 500ml", brand: "A", pack_size: "500ml", unit_price: 30, available: true },
      { name: "Family Milk 1L", brand: "A", pack_size: "1L", unit_price: 60, available: true }
    ];
    const r = compareProducts(itemWithMinSize, candidates, false);
    expect(r.status).toBe("PASS");
    expect(r.selected).toBe("Family Milk 1L");
    expect(r.pack_size).toBe("1L");
  });

  it("does accurate price comparison and picks lowest price among eligible candidates", () => {
    const candidates: ProductCandidate[] = [
      { name: "Bread A", brand: "BrandA", pack_size: "400g", unit_price: 55, available: true },
      { name: "Bread B", brand: "BrandB", pack_size: "400g", unit_price: 35, available: true },
      { name: "Bread C", brand: "BrandC", pack_size: "400g", unit_price: 45, available: true }
    ];
    const r = compareProducts(breadBranded, candidates, true);
    expect(r.status).toBe("PASS");
    expect(r.selected).toBe("Bread B");
    expect(r.unit_price).toBe(35);
  });

  it("ignores unavailable candidates", () => {
    const r = compareProducts(milkItem, [{ name: "X", brand: "X", pack_size: "1L", unit_price: 10, available: false }], false);
    expect(r.status).toBe("FAIL");
    expect(r.rationale).toMatch(/No available candidates/i);
  });

  it("rejects candidate when maximum_price is violated (no suitable candidate)", () => {
    const r = compareProducts(priceCapped, [{ name: "Yogurt 90g", brand: "E", pack_size: "90g", unit_price: 35, available: true }], true);
    expect(r.status).toBe("FAIL");
    expect(r.selected).toBeNull();
    expect(r.rationale).toMatch(/violates? maximum_price/i);
  });

  it("refuses substitute when brand is unavailable and allow_substitutions is false", () => {
    const r = compareProducts(breadBranded, [{ name: "Other Bread", brand: "Other", pack_size: "400g", unit_price: 30, available: true }], false);
    expect(r.status).toBe("FAIL");
    expect(r.rationale).toMatch(/substitutions not allowed/i);
  });

  it("substitutes only when allowed and records substitution rationale", () => {
    const r = compareProducts(breadBranded, [{ name: "Other Bread", brand: "Other", pack_size: "400g", unit_price: 30, available: true }], true);
    expect(r.status).toBe("PASS");
    expect(r.substituted).toBe(true);
    expect(r.selected).toBe("Other Bread");
  });

  it("fails safely and never invents data for null prices or missing details", () => {
    const r = compareProducts(milkItem, [{ name: "Mystery Milk", brand: null, pack_size: null, unit_price: null, available: true }], true);
    expect(r.status).toBe("FAIL");
    expect(r.selected).toBeNull();
  });

  it("fails when candidates list is empty (no candidates found)", () => {
    const r = compareProducts(milkItem, [], false);
    expect(r.status).toBe("FAIL");
    expect(r.selected).toBeNull();
    expect(r.rationale).toMatch(/No available candidates/i);
  });

  it("runCliCompare parses JSON inputs and selects winning index", () => {
    const itemStr = JSON.stringify(milkItem);
    const candStr = JSON.stringify(milkCandidates);
    const res = runCliCompare(itemStr, candStr, "false");
    expect(res.exitCode).toBe(0);
    const parsed = JSON.parse(res.output);
    expect(parsed.status).toBe("PASS");
    expect(parsed.selected).toBe("Mother Dairy Milk 500ml");
    expect(parsed.selectedIndex).toBe(1);
  });

  it("runCliCompare returns exitCode 2 when no candidate matches", () => {
    const itemStr = JSON.stringify(priceCapped);
    const candStr = JSON.stringify([{ name: "Expensive Yogurt", brand: "X", pack_size: "100g", unit_price: 99, available: true }]);
    const res = runCliCompare(itemStr, candStr, "true");
    expect(res.exitCode).toBe(2);
    const parsed = JSON.parse(res.output);
    expect(parsed.status).toBe("FAIL");
    expect(parsed.selected).toBeNull();
  });
});

