#!/usr/bin/env node
/* Keep the Content-Security-Policy in vercel.json in step with index.html.
 *
 * The page has two inline <script> blocks: the one that clears `no-js`, and
 * the JSON-LD business data. Chrome applies script-src to both — JSON-LD
 * included, even though it never executes — so each needs its SHA-256 in the
 * policy or it is dropped silently.
 *
 * apply-contact.mjs rewrites the JSON-LD block, which changes its hash, so
 * this runs straight after it. Do not hand-edit the sha256- entries.
 *
 *   node scripts/csp.mjs          rewrite the policy in vercel.json
 *   node scripts/csp.mjs --check  fail if it is out of date
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");

const html = readFileSync(join(root, "index.html"), "utf8");
const config = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));

/* Inline blocks only — <script src="..."> is covered by 'self'. */
const inline = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
if (inline.length === 0) throw new Error("no inline <script> blocks found in index.html");

const hashes = inline.map((body) => `'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);

const header = config.headers
  ?.flatMap((h) => h.headers)
  .find((h) => h.key.toLowerCase() === "content-security-policy");
if (!header) throw new Error("no Content-Security-Policy header in vercel.json");

const updated = header.value.replace(
  /script-src [^;]*/,
  `script-src 'self' ${hashes.join(" ")}`
);

if (check) {
  if (updated === header.value) {
    console.log(`vercel.json: CSP matches index.html (${hashes.length} inline scripts).`);
  } else {
    console.error("vercel.json: the CSP no longer matches index.html's inline scripts.");
    console.error("Run: npm run contact   (or: node scripts/csp.mjs)");
    process.exit(1);
  }
} else if (updated === header.value) {
  console.log(`vercel.json: CSP already matches index.html (${hashes.length} inline scripts).`);
} else {
  header.value = updated;
  writeFileSync(join(root, "vercel.json"), JSON.stringify(config, null, 2) + "\n");
  console.log(`vercel.json: CSP updated for ${hashes.length} inline scripts.`);
}
