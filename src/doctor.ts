/**
 * Readiness gate for Phase 2. Run: `npm run doctor`.
 * Checks everything checkable from here; GUI/manual steps are reported,
 * never performed. Exit 0 = ready for PAD test_mode run, 2 = blockers remain.
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

interface Check {
  name: string;
  ok: boolean;
  detail: string;
  /** False for informational checks that never fail the gate. */
  blocking?: boolean;
}

const checks: Check[] = [];
const push = (name: string, ok: boolean, detail: string, blocking = true) =>
  checks.push({ name, ok, detail, blocking });

function ps(cmd: string): string {
  try {
    return execSync(`powershell -NoProfile -Command "${cmd}"`, { encoding: "utf-8", timeout: 30000 }).trim();
  } catch {
    return "";
  }
}

// 1. OS
push("Windows OS", platform() === "win32", platform());

// 2. Browsers (project uses Chrome per user 2026-10-14; Edge kept as fallback)
const edgePaths = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
];
const chromePaths = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
];
const edge = edgePaths.find((p) => existsSync(p));
const chrome = chromePaths.find((p) => existsSync(p));
push("Microsoft Edge", edge !== undefined, edge ?? "not found");
push("Google Chrome (project browser)", chrome !== undefined, chrome ?? "not found");

// 3. PAD Appx
const padVer = ps("(Get-AppxPackage -Name Microsoft.PowerAutomateDesktop).Version");
push("Power Automate Desktop", padVer !== "", padVer === "" ? "Appx package not found" : `v${padVer}`);

// 4. PAD browser extension (name-based; IDs vary, never hardcoded).
// Scans Chrome first (project browser), then Edge.
function scanExtensions(profileExtDir: string): { found: boolean; names: string[] } {
  const names: string[] = [];
  let found = false;
  const extDir = profileExtDir;
  for (const id of readdirSync(extDir)) {
    const vers = readdirSync(join(extDir, id)).sort().reverse();
    const first = vers[0];
    if (!first) continue;
    let label = id;
    for (const cand of [join(extDir, id, first, "_locales", "en", "messages.json"), join(extDir, id, first, "manifest.json")]) {
      try {
        const j = JSON.parse(readFileSync(cand, "utf-8")) as Record<string, { message?: string } | string>;
        for (const k of ["appName", "extName", "name", "AppName"]) {
          const v = j[k];
          const msg = typeof v === "string" ? v : v?.message;
          if (msg && !msg.startsWith("__MSG_")) {
            label = msg;
            break;
          }
        }
      } catch {
        /* unreadable locale/manifest: keep id */
      }
    }
    names.push(label);
    if (label.toLowerCase().includes("power automate")) found = true;
  }
  return { found, names };
}

function scanDirOrMissing(dir: string): { found: boolean; names: string[] } {
  try {
    return scanExtensions(dir);
  } catch {
    return { found: false, names: [] };
  }
}

const chromeExt = scanDirOrMissing(join(homedir(), "AppData", "Local", "Google", "Chrome", "User Data", "Default", "Extensions"));
const edgeExt = scanDirOrMissing(join(homedir(), "AppData", "Local", "Microsoft", "Edge", "User Data", "Default", "Extensions"));
const extOk = chromeExt.found;
push(
  "PAD Chrome extension (project browser)",
  extOk,
  extOk ? "installed" : `MISSING in Chrome (have: ${chromeExt.names.length ? chromeExt.names.join("; ") : "none/profile inaccessible"})`
);
push("PAD Edge extension (fallback, informational)", edgeExt.found, edgeExt.found ? "installed" : "not installed — Chrome is the project browser", false);

// 5. Config present + valid (informational; user owns recipients)
push(
  "config.json present",
  existsSync("config.json"),
  existsSync("config.json") ? "found (validate with npm run validate-config)" : "absent — copy config.example.json and set approved label/recipients"
);

// 6. PAD exports present? (.robin clipboard specs + manifest; native Designer import still requires paste + recorder capture)
const exportDir = "pad-flows/exports";
let exportDetail = "create 5 flows per pad-flows/README.md, export to pad-flows/exports/";
let exportsOk = false;
try {
  const robins = readdirSync(exportDir).filter((f) => f.endsWith(".robin"));
  exportsOk = robins.length >= 5;
  exportDetail = exportsOk
    ? `${robins.length} .robin spec(s) present (paste-verify in Designer + recorder capture still required)`
    : `only ${robins.length} .robin file(s) — 5 required`;
} catch {
  exportDetail = "pad-flows/exports/ inaccessible";
}
push("pad-flows exports", exportsOk, exportDetail);

// 7. Demo media present?
const shots = existsSync("screenshots") ? readdirSync("screenshots").filter((f) => f !== ".gitkeep") : [];
const recs = existsSync("recording") ? readdirSync("recording").filter((f) => f !== ".gitkeep") : [];
push("screenshots + recording", shots.length >= 14 && recs.length >= 1, `${shots.length}/14 screenshots, ${recs.length} recording(s) per docs/demo-script.md`);

for (const c of checks) console.log(`${c.ok ? "[READY]" : c.blocking === false ? "[INFO]" : "[BLOCKED]"} ${c.name} — ${c.detail}`);
const blocked = checks.filter((c) => !c.ok && c.blocking !== false);
console.log(blocked.length === 0 ? "DOCTOR: ready for PAD test_mode run." : `DOCTOR: ${blocked.length} blocker(s) remain — see [BLOCKED] lines.`);
process.exit(blocked.length === 0 ? 0 : 2);
