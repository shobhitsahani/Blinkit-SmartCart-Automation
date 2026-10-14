import { AutomationError, type ErrorCategory } from "./AutomationError.js";

/**
 * Map a raw failure to a standard error category:
 * ADDRESS, PRODUCT_NOT_FOUND, PRODUCT_AMBIGUOUS, CART, BUDGET, AUTH, TRANSIENT, CONFIG, NOTIFICATION, SAFETY.
 */
export function classifyError(operation: string, message: string): AutomationError {
  const m = `${operation} ${message}`.toLowerCase();
  const mk = (category: ErrorCategory, retryable: boolean, safeToContinue: boolean) =>
    new AutomationError(category, message, { retryable, safeToContinue });

  if (m.includes("safety") || m.includes("payment") || m.includes("checkout") || m.includes("order") || m.includes("forbidden"))
    return mk("SAFETY", false, false);
  if (m.includes("address") || m.includes("location"))
    return mk("ADDRESS", false, false);
  if (m.includes("auth") || m.includes("login") || m.includes("otp") || m.includes("captcha"))
    return mk("AUTH", false, false);
  if (m.includes("ambiguous") || m.includes("multiple matches") || m.includes("unclear"))
    return mk("PRODUCT_AMBIGUOUS", false, false);
  if (m.includes("unavailable") || m.includes("out of stock") || m.includes("not found"))
    return mk("PRODUCT_NOT_FOUND", false, true);
  if (m.includes("cart") || m.includes("quantity") || m.includes("qty") || m.includes("line_total"))
    return mk("CART", false, false);
  if (m.includes("budget") || m.includes("overrun") || m.includes("limit"))
    return mk("BUDGET", false, true);
  if (m.includes("config") || m.includes("validation") || m.includes("schema") || m.includes("json"))
    return mk("CONFIG", false, false);
  if (m.includes("gmail") || m.includes("email") || m.includes("whatsapp") || m.includes("notification"))
    return mk("NOTIFICATION", false, true);
  if (m.includes("timeout") || m.includes("network") || m.includes("slow") || m.includes("connection"))
    return mk("TRANSIENT", true, true);

  return mk("UNEXPECTED_UI_CHANGE", false, false);
}
