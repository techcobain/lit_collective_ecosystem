#!/usr/bin/env node
// Aggregate rfps/*.json into public/rfps.json so the frontend gets one fetch.

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(ROOT, "rfps");
const OUT_DIR = path.join(ROOT, "public");
const OUT = path.join(OUT_DIR, "rfps.json");

mkdirSync(SRC, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith(".json")).sort();
const rfps = [];
const errors = [];

for (const f of files) {
  try {
    const raw = readFileSync(path.join(SRC, f), "utf8");
    rfps.push({ slug: f.replace(/\.json$/, ""), ...JSON.parse(raw) });
  } catch (e) {
    errors.push(`${f}: ${e.message}`);
  }
}

if (errors.length) {
  console.error("RFP build errors:");
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}

writeFileSync(OUT, JSON.stringify({ rfps, generatedAt: new Date().toISOString() }, null, 2) + "\n");
console.log(`Built ${OUT} (${rfps.length} RFPs)`);
