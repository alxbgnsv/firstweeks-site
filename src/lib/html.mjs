// Tiny HTML helpers — escaping + attribute building for template literals.

export function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Minify: collapse inter-tag whitespace without touching <pre>-like content (we have none).
export function minify(html) {
  return html.replace(/\n\s+/g, '\n').replace(/>\s+</g, '><').trim();
}

// Guard: any unresolved {placeholder} in final HTML is a build error (§ answer 2).
export function assertNoPlaceholders(html, where) {
  const m = html.match(/\{[a-z_]+\}/i);
  if (m) throw new Error(`Unresolved placeholder ${m[0]} in ${where}`);
}
