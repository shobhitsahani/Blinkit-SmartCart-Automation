/**
 * Local dev server — `npm run dev`.
 * Serves the generated `outputs/` reports + a small dashboard.
 * Read-only, test_mode safe: never triggers orders, payments, or live sends.
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, normalize } from "node:path";

const PORT = Number(process.env.PORT ?? 3100);
const ROOT = process.cwd();
const OUTPUTS_DIR = join(ROOT, "outputs");

const ALLOWED_FILES: Record<string, string> = {
  "shopping_summary.json": "application/json; charset=utf-8",
  "shopping_summary.html": "text/html; charset=utf-8",
  "execution_log.csv": "text/csv; charset=utf-8",
  "execution_report.txt": "text/plain; charset=utf-8",
};

function send(res: ServerResponse, status: number, body: string, contentType: string): void {
  res.writeHead(status, { "content-type": contentType });
  res.end(body);
}

function dashboardHtml(): string {
  const files = Object.keys(ALLOWED_FILES)
    .map((f) => {
      const full = join(OUTPUTS_DIR, f);
      const ok = existsSync(full);
      const size = ok
        ? (() => {
            try {
              return ` (${statSync(full).size} bytes)`;
            } catch {
              return "";
            }
          })()
        : " (not generated yet — run npm run gen-summary)";
      return `<li><a href="/outputs/${f}">${f}</a> — ${ok ? "ready" : "missing"}${size}</li>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>Blinkit SmartCart — Dev Server</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem}code{background:#f3f4f6;padding:2px 6px;border-radius:4px}</style>
</head><body>
<h1>Blinkit SmartCart Automation — dev server</h1>
<p>Safety: read-only report viewer. No order / payment automation exists. Test_mode mock data only.</p>
<h2>Reports</h2><ul>${files}</ul>
<h2>API</h2><ul>
<li><a href="/api/status"><code>/api/status</code></a> — server + outputs presence</li>
<li><a href="/api/summary"><code>/api/summary</code></a> — shopping_summary.json or honest 404</li>
</ul>
<h2>Useful commands</h2><ul>
<li><code>npm run validate-config -- config.example.json</code></li>
<li><code>npm run gen-summary -- config.example.json</code></li>
<li><code>npm test</code></li>
</ul></body></html>`;
}

function statusJson(): string {
  const outputs: Record<string, boolean> = {};
  for (const f of Object.keys(ALLOWED_FILES)) outputs[f] = existsSync(join(OUTPUTS_DIR, f));
  return JSON.stringify(
    {
      ok: true,
      service: "blinkit-smartcart-dev-server",
      safety: "read-only; no order or payment automation",
      port: PORT,
      outputs,
    },
    null,
    2,
  );
}

function handle(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url ?? "/", "http://localhost");
  const path = url.pathname;

  if (path === "/") return send(res, 200, dashboardHtml(), "text/html; charset=utf-8");
  if (path === "/api/status") return send(res, 200, statusJson(), "application/json; charset=utf-8");
  if (path === "/api/summary") {
    const full = join(OUTPUTS_DIR, "shopping_summary.json");
    if (!existsSync(full)) return send(res, 404, JSON.stringify({ ok: false, error: "shopping_summary.json not generated yet — run npm run gen-summary" }), "application/json; charset=utf-8");
    return send(res, 200, readFileSync(full, "utf-8"), "application/json; charset=utf-8");
  }
  if (path.startsWith("/outputs/")) {
    const name = normalize(path.slice("/outputs/".length));
    if (!Object.hasOwn(ALLOWED_FILES, name) || name.includes("..") || name.includes("/")) {
      return send(res, 404, "Not found", "text/plain; charset=utf-8");
    }
    const full = join(OUTPUTS_DIR, name);
    if (!existsSync(full)) {
      return send(res, 404, `${name} not generated yet — run npm run gen-summary`, "text/plain; charset=utf-8");
    }
    const contentType = ALLOWED_FILES[name] ?? "application/octet-stream";
    return send(res, 200, readFileSync(full, "utf-8"), contentType);
  }
  return send(res, 404, "Not found — try / , /api/status, /outputs/shopping_summary.html", "text/plain; charset=utf-8");
}

const server = createServer(handle);
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} in use — retry with a free port, e.g. $env:PORT=3101; npm run dev`);
    process.exit(1);
  }
  throw err;
});
server.listen(PORT, () => {
  console.log(JSON.stringify({ event: "dev-server-ready", port: PORT, url: `http://localhost:${PORT}`, outputsDir: OUTPUTS_DIR }));
});
