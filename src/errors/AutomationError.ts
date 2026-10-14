/** Typed automation error with retry/safety semantics. */

export type StandardErrorCategory =
  | "ADDRESS"
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_AMBIGUOUS"
  | "CART"
  | "BUDGET"
  | "AUTH"
  | "TRANSIENT"
  | "CONFIG"
  | "NOTIFICATION"
  | "SAFETY";

export type ErrorCategory =
  | StandardErrorCategory
  | "CONFIGURATION_ERROR"
  | "BROWSER_LAUNCH_FAILURE"
  | "AUTHENTICATION_FAILURE"
  | "ADDRESS_VERIFICATION_FAILURE"
  | "PRODUCT_SEARCH_FAILURE"
  | "PRODUCT_UNAVAILABLE"
  | "PRICE_EXTRACTION_FAILURE"
  | "CART_VALIDATION_FAILURE"
  | "BUDGET_EXCEEDED"
  | "GMAIL_NOTIFICATION_FAILURE"
  | "WHATSAPP_NOTIFICATION_FAILURE"
  | "UNEXPECTED_UI_CHANGE"
  | "TIMEOUT_OR_NETWORK_FAILURE";

export class AutomationError extends Error {
  readonly category: ErrorCategory;
  /** Transient (slow page, network blip) => bounded retry allowed. */
  readonly retryable: boolean;
  /** False => main flow must stop (address/cart/safety compromised). */
  readonly safeToContinue: boolean;

  constructor(category: ErrorCategory, message: string, opts?: { retryable?: boolean; safeToContinue?: boolean }) {
    super(message);
    this.name = "AutomationError";
    this.category = category;
    this.retryable = opts?.retryable ?? false;
    this.safeToContinue = opts?.safeToContinue ?? false;
  }
}
