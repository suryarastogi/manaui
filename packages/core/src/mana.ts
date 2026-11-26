/**
 * Mana cost parsing. Output symbols are mana-font class suffixes
 * (https://mana.andrewgioia.com): `{2}` → `"2"`, `{W}` → `"w"`,
 * `{B/R}` → `"br"`, `{W/P}` → `"wp"`.
 */

export const WUBRG: readonly ['W', 'U', 'B', 'R', 'G'] = ['W', 'U', 'B', 'R', 'G'];

export const COLOR_NAMES: Readonly<Record<string, string>> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
  C: 'Colorless',
};

/**
 * Split `"{2}{W}{B/R}"` into symbols (`["2","w","br"]`). Hybrid and
 * phyrexian symbols drop the slash; anything unrecognised passes through
 * lowercased.
 */
export function parseManaCost(cost: string): string[] {
  const out: string[] = [];
  const re = /\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cost)) !== null) {
    const inner = m[1]!.toLowerCase();
    out.push(inner.includes('/') ? inner.replace(/\//g, '') : inner);
  }
  return out;
}

/**
 * Per-face symbol groups of a multi-face cost: adventures, split cards and
 * modal DFCs arrive as `"{2}{R} // {R}"`. Faces with no symbols drop out, so
 * a costless back face leaves no dangling separator.
 */
export function parseManaCostFaces(cost: string): string[][] {
  return cost
    .split('//')
    .map((face) => parseManaCost(face))
    .filter((face) => face.length > 0);
}

/**
 * Colour letters in canonical WUBRG order, upper-cased and de-duplicated.
 * Empty input yields `[]`; callers decide how to show colourless.
 */
export function sortColors(colors: readonly string[] | null | undefined): string[] {
  const present = new Set((colors ?? []).map((c) => c.toUpperCase()));
  return WUBRG.filter((c) => present.has(c));
}
