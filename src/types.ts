/** Shared types for Blinkit SmartCart Automation. */

export type Status = "PASS" | "FAIL" | "WARNING" | "SKIPPED" | "NOT_VERIFIED";
export type NotifyStatus = "SENT" | "FAILED" | "SKIPPED" | "UNSUPPORTED";

export interface GroceryItem {
  name: string;
  quantity: number;
  unit: string;
  preferred_brand: string | null;
  minimum_size: string | null;
  maximum_price: number | null;
  allow_substitution?: boolean;
}

export interface ShoppingConfig {
  budget: number;
  currency: string;
  delivery_address: { label: string };
  preferences: {
    selection_strategy: "best_value" | "cheapest" | "preferred_brand";
    allow_substitutions: boolean;
    allow_quantity_adjustment: boolean;
  };
  items: GroceryItem[];
  notifications: {
    email_enabled: boolean;
    email_recipient: string;
    whatsapp_enabled: boolean;
    whatsapp_recipient: string;
    test_mode: boolean;
  };
  runtime: {
    output_dir: string;
    screenshots_enabled: boolean;
    log_level: "INFO" | "WARNING" | "ERROR";
    max_retries: number;
    timeout_ms: number;
  };
}

export interface ProductCandidate {
  name: string;
  brand: string | null;
  pack_size: string | null;
  unit_price: number | null;
  available: boolean;
}

export interface SelectionResult {
  requested: string;
  selected: string | null;
  brand: string | null;
  pack_size: string | null;
  unit_price: number | null;
  status: Status;
  rationale: string;
  substituted: boolean;
}

export interface CartLine {
  product: string;
  brand: string | null;
  pack_size: string | null;
  requested_qty: number;
  actual_qty: number | null;
  unit_price: number | null;
  line_total: number | null;
  verified: boolean;
}
