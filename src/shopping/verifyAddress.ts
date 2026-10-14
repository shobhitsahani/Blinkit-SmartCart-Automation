import type { Status } from "../types.js";

export interface AddressCheck {
  expected: string;
  displayed: string | null;
  status: Status;
  detail: string;
}

/** Normalize labels for comparison: trim, collapse spaces, case-insensitive. */
export function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Verify the Blinkit-displayed address against the approved label.
 * - displayed === null (element missing/ambiguous) => FAIL, never assume selection.
 * - Only an exact normalized match => PASS.
 */
export function verifyAddress(expectedLabel: string, displayedLabel: string | null): AddressCheck {
  if (displayedLabel === null || displayedLabel.trim() === "") {
    return {
      expected: expectedLabel,
      displayed: displayedLabel,
      status: "FAIL",
      detail: "Displayed address missing or ambiguous — shopping must stop."
    };
  }
  const pass = normalizeLabel(expectedLabel) === normalizeLabel(displayedLabel);
  return {
    expected: expectedLabel,
    displayed: displayedLabel,
    status: pass ? "PASS" : "FAIL",
    detail: pass
      ? "Displayed address matches the approved label."
      : "Displayed address does NOT match the approved label — shopping must stop."
  };
}
