import { describe, expect, it } from "vitest";
import { shoppingConfigSchema } from "../src/config/config.schema.js";
import { loadConfig } from "../src/config/loader.js";
import { validConfig } from "./fixtures.js";

describe("config validation", () => {
  it("accepts the example config", () => {
    expect(() => shoppingConfigSchema.parse(validConfig)).not.toThrow();
  });
  it("rejects empty items", () => {
    expect(() => shoppingConfigSchema.parse({ ...validConfig, items: [] })).toThrow();
  });
  it("rejects bad quantity and budget", () => {
    expect(() => shoppingConfigSchema.parse({ ...validConfig, budget: -5 })).toThrow();
    expect(() =>
      shoppingConfigSchema.parse({ ...validConfig, items: [{ ...validConfig.items[0], quantity: 0 }] })
    ).toThrow();
  });
  it("rejects secrets in config", () => {
    expect(() => shoppingConfigSchema.parse({ ...validConfig, api_key: "xxx" } as unknown)).toThrow();
  });
  it("requires recipient when email enabled", () => {
    expect(() =>
      shoppingConfigSchema.parse({ ...validConfig, notifications: { ...validConfig.notifications, email_recipient: "not-an-email" } })
    ).toThrow();
  });
  it("loadConfig successfully loads config.example.json", () => {
    const cfg = loadConfig("config.example.json");
    expect(cfg.items.length).toBeGreaterThan(0);
    expect(cfg.budget).toBeGreaterThan(0);
  });
  it("loadConfig throws descriptive error on missing file path", () => {
    expect(() => loadConfig("nonexistent-file.json")).toThrow(/Config file not found at/);
  });
  it("loadConfig throws on empty file path", () => {
    expect(() => loadConfig("")).toThrow(/non-empty string/);
  });
});
