import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { compareProducts } from "./compareProducts.js";
import type { GroceryItem, ProductCandidate } from "../types.js";

function parseInput<T>(input: string): T {
  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return JSON.parse(trimmed) as T;
  }
  const resolved = resolve(process.cwd(), trimmed);
  if (existsSync(resolved)) {
    const content = readFileSync(resolved, "utf-8");
    return JSON.parse(content) as T;
  }
  // Fall back to direct parse
  return JSON.parse(trimmed) as T;
}

/**
 * CLI utility to execute deterministic product comparison from PAD or scripts.
 * Supports passing either raw JSON or path to a JSON file.
 * Usage:
 *   tsx src/shopping/cliCompare.ts <itemJsonOrPath> <candidatesJsonOrPath> [allowSubstitutions]
 */
export function runCliCompare(arg0: string, arg1: string, arg2?: string): {
  output: string;
  exitCode: number;
} {
  let item: GroceryItem;
  let candidates: ProductCandidate[];
  let allowSubstitutions = false;

  try {
    item = parseInput<GroceryItem>(arg0);
  } catch (err) {
    return {
      output: `Failed to parse item: ${err instanceof Error ? err.message : String(err)}`,
      exitCode: 1
    };
  }

  try {
    candidates = parseInput<ProductCandidate[]>(arg1);
  } catch (err) {
    return {
      output: `Failed to parse candidates: ${err instanceof Error ? err.message : String(err)}`,
      exitCode: 1
    };
  }

  if (arg2) {
    allowSubstitutions = arg2 === "true" || arg2 === "1";
  }

  const result = compareProducts(item, candidates, allowSubstitutions);
  let selectedIndex = -1;
  if (result.selected !== null) {
    selectedIndex = candidates.findIndex((c) => c.name === result.selected);
  }

  const payload = {
    ...result,
    selectedIndex
  };

  return {
    output: JSON.stringify(payload, null, 2),
    exitCode: result.status === "PASS" ? 0 : 2
  };
}

function main() {
  const args = process.argv.slice(2);
  const arg0 = args[0];
  const arg1 = args[1];

  if (!arg0 || !arg1) {
    console.error("Usage: tsx src/shopping/cliCompare.ts <itemJsonOrPath> <candidatesJsonOrPath> [allowSubstitutions]");
    process.exit(1);
  }

  const { output, exitCode } = runCliCompare(arg0, arg1, args[2]);
  if (exitCode === 1) {
    console.error(output);
  } else {
    console.log(output);
  }
  process.exit(exitCode);
}

if (process.argv[1]?.endsWith("cliCompare.ts") || process.argv[1]?.endsWith("cliCompare.js")) {
  main();
}
