import { z } from "zod";

/** Zod schema mirrors src/types.ts ShoppingConfig. Secrets are forbidden here. */
export const groceryItemSchema = z
  .object({
  name: z.string().min(1, "item name required"),
  quantity: z.number().int().positive("quantity must be a positive integer"),
  unit: z.string().min(1, "unit required"),
  preferred_brand: z.string().nullable(),
  minimum_size: z.string().nullable(),
  maximum_price: z.number().positive().nullable(),
  allow_substitution: z.boolean().optional()
  })
  .strict();

const FORBIDDEN_KEYS = ["password", "api_key", "apikey", "token", "secret", "credential"];

export const shoppingConfigSchema = z
  .object({
    budget: z.number().positive("budget must be positive"),
    currency: z.string().default("INR"),
    delivery_address: z.object({ label: z.string().min(1, "delivery address label required") }).strict(),
    preferences: z.object({
      selection_strategy: z.enum(["best_value", "cheapest", "preferred_brand"]),
      allow_substitutions: z.boolean(),
      allow_quantity_adjustment: z.boolean()
    }).strict(),
    items: z.array(groceryItemSchema).min(1, "at least one grocery item required"),
    notifications: z.object({
      email_enabled: z.boolean(),
      email_recipient: z.string(),
      whatsapp_enabled: z.boolean(),
      whatsapp_recipient: z.string(),
      test_mode: z.boolean()
    }).strict(),
    runtime: z.object({
      output_dir: z.string().min(1),
      screenshots_enabled: z.boolean(),
      log_level: z.enum(["INFO", "WARNING", "ERROR"]),
      max_retries: z.number().int().min(0).max(5),
      timeout_ms: z.number().int().positive()
    }).strict()
  })
  .strict()
  .superRefine((val, ctx) => {
    const raw = JSON.stringify(val).toLowerCase();
    for (const key of FORBIDDEN_KEYS) {
      if (raw.includes(`"${key}"`)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `config must not contain secrets (${key})` });
      }
    }
    if (val.notifications.email_enabled && !val.notifications.email_recipient.includes("@")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "valid email_recipient required when email_enabled", path: ["notifications", "email_recipient"] });
    }
  });

export type ValidatedConfig = z.infer<typeof shoppingConfigSchema>;
