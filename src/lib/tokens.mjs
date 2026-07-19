// {name} neutralization for the site (§ answer 2). App content uses only
// {name} (no {pronoun}); "your baby" is singular so verb agreement stays
// correct everywhere. Old 39 articles + week bodies go through this; new
// B*.json articles and archive week-summaries are already clean.
export function neutralizeName(text) {
  if (text == null) return text;
  let s = String(text);
  // possessive first: {name}'s / {name}’s → your baby's
  s = s.replace(/\{name\}(['’])s/g, 'your baby$1s');
  // sentence-initial (start / after . ! ? / after — or ") → Your baby
  s = s.replace(/(^|[.!?]\s+|[—"“]\s*)\{name\}/g, '$1Your baby');
  // everything else → your baby
  s = s.replace(/\{name\}/g, 'your baby');
  return s;
}

// Deep-neutralize an object/array/string tree (used for old article/week bodies).
export function neutralizeTree(node) {
  if (typeof node === 'string') return neutralizeName(node);
  if (Array.isArray(node)) return node.map(neutralizeTree);
  if (node && typeof node === 'object') {
    const out = {};
    for (const k of Object.keys(node)) out[k] = neutralizeTree(node[k]);
    return out;
  }
  return node;
}
