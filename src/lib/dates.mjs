// content-dates.json hash-lock (§ answer 3). Each item stores a content hash
// + dates. Hash changed → dateModified bumps to today; unchanged → kept, so a
// rebuild without content changes never fakes freshness. datePublished set once.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/../..';
const FILE = path.join(ROOT, 'content/content-dates.json');

// Seed date = content archive review date (README: сборка 19.07). Used for
// items that existed before dating started; new items get the build's date.
const SEED_ISO = '2026-06-15';

function hash(obj) {
  return crypto.createHash('sha1').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}

let store = {};
let today = null;
let dirty = false;

export function initDates(buildDateISO) {
  today = buildDateISO;
  try { store = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { store = {}; }
}

// key: e.g. "week-5" or "article:cluster-feeding". contentForHash: the item.
// firstSeen: ISO to use as datePublished when the key is brand new (batch date).
export function dateFor(key, contentForHash, firstSeen = SEED_ISO) {
  const h = hash(contentForHash);
  const prev = store[key];
  if (!prev) {
    store[key] = { hash: h, published: firstSeen, modified: firstSeen };
    dirty = true;
  } else if (prev.hash !== h) {
    store[key] = { hash: h, published: prev.published, modified: today };
    dirty = true;
  }
  return store[key];
}

export function persistDates() {
  if (!dirty) return;
  fs.writeFileSync(FILE, JSON.stringify(store, null, 2) + '\n');
}

// "June 2026" from ISO for the visible E-E-A-T line.
export function humanMonth(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
