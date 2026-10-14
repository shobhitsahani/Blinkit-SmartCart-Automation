import type { GroceryItem, ProductCandidate, SelectionResult } from "../types.js";

function packSizeMatches(minimumSize: string | null, candidateSize: string | null): boolean {
  if (minimumSize === null) return true;
  if (candidateSize === null) return false; // never assume equivalence
  return candidateSize.toLowerCase().includes(minimumSize.toLowerCase());
}

/**
 * Deterministic selection:
 * 1. drop unavailable / null-price candidates
 * 2. enforce maximum_price (mandatory) and minimum_size (when reconcilable)
 * 3. prefer configured brand; 4. cheapest unit price wins (best_value/cheapest);
 *    preferred_brand strategy picks cheapest of the preferred brand, falling back
 *    to best value only if substitutions allowed
 * 5. substitute flag recorded; unrelated silent replacement never happens
 */
export function compareProducts(
  item: GroceryItem,
  candidates: ProductCandidate[],
  allowSubstitutions: boolean
): SelectionResult {
  const base = { requested: item.name, substituted: false } as const;
  const available = candidates.filter((c) => c.available && c.unit_price !== null);
  if (available.length === 0) {
    return { ...base, selected: null, brand: null, pack_size: null, unit_price: null, status: "FAIL", rationale: "No available candidates with a verified price." };
  }
  let eligible = available.filter(
    (c) =>
      (item.maximum_price === null || (c.unit_price as number) <= item.maximum_price) &&
      packSizeMatches(item.minimum_size, c.pack_size)
  );
  if (eligible.length === 0) {
    return { ...base, selected: null, brand: null, pack_size: null, unit_price: null, status: "FAIL", rationale: "Candidates exist but all violate maximum_price/minimum_size constraints." };
  }
  const strategy = item.preferred_brand ? "brand-aware" : "best_value";
  void strategy;
  let pool = eligible;
  let substituted = false;
  if (item.preferred_brand) {
    const brandMatch = eligible.filter(
      (c) => c.brand !== null && c.brand.toLowerCase() === (item.preferred_brand as string).toLowerCase()
    );
    if (brandMatch.length > 0) {
      pool = brandMatch;
    } else if (!allowSubstitutions && item.allow_substitution !== true) {
      return { ...base, selected: null, brand: null, pack_size: null, unit_price: null, status: "FAIL", rationale: `Preferred brand '${item.preferred_brand}' unavailable and substitutions not allowed.` };
    } else {
      substituted = true;
    }
  }
  const best = pool.reduce((a, b) => ((a.unit_price as number) <= (b.unit_price as number) ? a : b));
  const why = item.preferred_brand && !substituted && best.brand?.toLowerCase() === (item.preferred_brand as string).toLowerCase()
    ? `Preferred brand match; cheapest at ${best.unit_price}.`
    : substituted
      ? `Preferred brand unavailable; substitute '${best.name}' cheapest eligible at ${best.unit_price} (substitutions allowed).`
      : `No brand preference; cheapest eligible at ${best.unit_price} (best value).`;
  return {
    ...base,
    selected: best.name,
    brand: best.brand,
    pack_size: best.pack_size,
    unit_price: best.unit_price,
    status: "PASS",
    rationale: why,
    substituted
  };
}
