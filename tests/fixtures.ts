import type { CartLine, GroceryItem, ProductCandidate } from "../src/types.js";

export const milkItem: GroceryItem = { name: "milk", quantity: 1, unit: "pack", preferred_brand: null, minimum_size: null, maximum_price: null };
export const breadBranded: GroceryItem = { name: "bread", quantity: 1, unit: "pack", preferred_brand: "Harvest Gold", minimum_size: null, maximum_price: 50 };
export const priceCapped: GroceryItem = { name: "yogurt", quantity: 1, unit: "pack", preferred_brand: null, minimum_size: null, maximum_price: 30 };

export const milkCandidates: ProductCandidate[] = [
  { name: "Amul Taaza Milk 500ml", brand: "Amul", pack_size: "500ml", unit_price: 30, available: true },
  { name: "Mother Dairy Milk 500ml", brand: "Mother Dairy", pack_size: "500ml", unit_price: 29, available: true },
  { name: "Stale Milk 500ml", brand: "Unknown", pack_size: "500ml", unit_price: 20, available: false }
];

export const goodCart: CartLine[] = [
  { product: "Amul Taaza Milk 500ml", brand: "Amul", pack_size: "500ml", requested_qty: 1, actual_qty: 1, unit_price: 30, line_total: 30, verified: true },
  { product: "Harvest Gold White Bread 400g", brand: "Harvest Gold", pack_size: "400g", requested_qty: 1, actual_qty: 1, unit_price: 40, line_total: 40, verified: true }
];

export const validConfig = {
  budget: 500,
  currency: "INR",
  delivery_address: { label: "Approved Test Address" },
  preferences: { selection_strategy: "best_value", allow_substitutions: false, allow_quantity_adjustment: false },
  items: [{ name: "milk", quantity: 1, unit: "pack", preferred_brand: null, minimum_size: null, maximum_price: null }],
  notifications: { email_enabled: true, email_recipient: "a@example.com", whatsapp_enabled: false, whatsapp_recipient: "+91-0000000000", test_mode: true },
  runtime: { output_dir: "outputs", screenshots_enabled: true, log_level: "INFO", max_retries: 2, timeout_ms: 15000 }
};
