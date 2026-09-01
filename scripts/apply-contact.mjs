#!/usr/bin/env node
/* Rewrite every contact detail in index.html from contact.json.
 *
 * The phone number appears in the header, hero, CTA band, footer and the
 * structured-data block; the WhatsApp number in five links. This script is
 * the single source of truth the handoff asks for — edit contact.json, run
 * `npm run contact`, commit the diff.
 *
 *   node scripts/apply-contact.mjs          rewrite index.html
 *   node scripts/apply-contact.mjs --check  report what is still a placeholder
 *
 * No dependencies; Node 18+.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const page = join(root, "index.html");
const check = process.argv.includes("--check");

const c = JSON.parse(readFileSync(join(root, "contact.json"), "utf8"));

const digits = c.whatsapp.replace(/\D/g, "");
const e164 = "+" + digits;
const telHref = "tel:" + c.phone.replace(/\s/g, "");
// encodeURIComponent leaves the apostrophe alone; encode it so the href needs no quoting care.
const waHref = "https://wa.me/" + digits + "?text=" + encodeURIComponent(c.waPrefill).replace(/'/g, "%27");

/* Placeholders carried over from the design mock. Anything still matching
   these at launch is a bug, not a decision. */
const PLACEHOLDERS = ["www.sidebysidesupport.co.uk"];

/* Matched by shape, not by their current value, so the script keeps working
   after the first swap. */
const RULES = [
  [/tel:[0-9+\s]+/g, telHref],
  [/https:\/\/wa\.me\/[^"]*/g, waHref],
  [/mailto:[^"]+/g, "mailto:" + c.email],
  [/"telephone":\s*"[^"]*"/g, `"telephone": "${e164}"`],
  [/"email":\s*"[^"]*"/g, `"email": "${c.email}"`],
  [/"url":\s*"[^"]*"/g, `"url": "${c.siteUrl}"`],
  [/(<link rel="canonical" href=")[^"]*/g, `$1${c.siteUrl}`],
  [/(<meta property="og:url" content=")[^"]*/g, `$1${c.siteUrl}`],
  // Landline ("020 3918 4151") and mobile ("07337 211695") groupings alike.
  [/\b0\d{2,4}\s\d{3,6}(?:\s\d{3,4})?\b/g, c.phone],
  [/(?<!["/:])\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, c.email], // the address as displayed
];

const before = readFileSync(page, "utf8");

if (check) {
  const found = PLACEHOLDERS.filter((p) => before.includes(p));
  if (found.length === 0) {
    console.log("index.html: no mock placeholders left.");
  } else {
    console.error("index.html still carries mock placeholders:");
    for (const f of found) console.error("  - " + f);
    console.error("\nReplace them in contact.json, then run: npm run contact");
    process.exit(1);
  }
} else {
  let after = before;
  for (const [re, to] of RULES) after = after.replace(re, to);
  if (after === before) {
    console.log("index.html already matches contact.json — nothing to do.");
  } else {
    writeFileSync(page, after);
    console.log(
      `index.html updated:\n` +
      `  phone     ${c.phone}  (${telHref})\n` +
      `  whatsapp  ${waHref}\n` +
      `  email     ${c.email}\n` +
      `  site      ${c.siteUrl}`
    );
  }
}
