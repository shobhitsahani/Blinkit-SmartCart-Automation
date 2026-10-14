import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { shoppingConfigSchema, type ValidatedConfig } from "./config.schema.js";

/** Load + validate a config file. Throws on missing file, unreadable file, secrets, malformed JSON, or schema error. */
export function loadConfig(filePath: string): ValidatedConfig {
  if (!filePath || typeof filePath !== "string" || filePath.trim() === "") {
    throw new Error("Config file path must be a non-empty string.");
  }
  const resolved = resolve(process.cwd(), filePath);
  if (!existsSync(resolved)) {
    throw new Error(`Config file not found at: ${resolved}`);
  }
  let raw: string;
  try {
    raw = readFileSync(resolved, "utf-8");
  } catch (err) {
    throw new Error(`Failed to read config file at ${resolved}: ${err instanceof Error ? err.message : String(err)}`);
  }
  for (const key of ["password", "api_key", "apikey", "token", "secret", "credential"]) {
    if (new RegExp(`"${key}"\\s*:`, "i").test(raw)) {
      throw new Error(`Config INVALID: must not contain secrets (${key})`);
    }
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Config INVALID: Malformed JSON at ${resolved}: ${err instanceof Error ? err.message : String(err)}`);
  }
  return shoppingConfigSchema.parse(parsed);
}

// CLI invocation: `tsx src/config/loader.ts [path]`
const explicitArg = process.argv[2];
const target = explicitArg ?? (existsSync("config.json") ? "config.json" : "config.example.json");

try {
  const cfg = loadConfig(target);
  console.log(`Config OK (${target}): ${cfg.items.length} item(s), budget ${cfg.budget} ${cfg.currency}, test_mode=${cfg.notifications.test_mode}`);
} catch (err) {
  console.error("Config INVALID:", err instanceof Error ? err.message : err);
  process.exit(1);
}
