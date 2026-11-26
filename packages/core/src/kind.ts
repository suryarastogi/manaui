/**
 * Primary card type ("kind") from a type line.
 *
 * Precedence doubles as detection priority and display order: a card with
 * several types is classified by the first match (`"Artifact Creature"` →
 * Creature, `"Basic Land — Forest"` → Land), and groups list in this order,
 * lands last as decklists usually have them.
 */

export const KIND_ORDER: readonly [
  'Creature',
  'Planeswalker',
  'Instant',
  'Sorcery',
  'Artifact',
  'Enchantment',
  'Battle',
  'Land',
] = [
  'Creature',
  'Planeswalker',
  'Instant',
  'Sorcery',
  'Artifact',
  'Enchantment',
  'Battle',
  'Land',
];

export type CardKind = (typeof KIND_ORDER)[number] | 'Other';

export const KIND_PLURAL: Readonly<Record<CardKind, string>> = {
  Creature: 'Creatures',
  Planeswalker: 'Planeswalkers',
  Instant: 'Instants',
  Sorcery: 'Sorceries',
  Artifact: 'Artifacts',
  Enchantment: 'Enchantments',
  Battle: 'Battles',
  Land: 'Lands',
  Other: 'Other',
};

/**
 * The primary card type for a type line. Only the front face counts for
 * multi-faced cards. Unrecognised or empty → `Other`.
 */
export function primaryKind(typeLine: string | null | undefined): CardKind {
  const front = (typeLine ?? '').split('//')[0]!;
  for (const kind of KIND_ORDER) {
    if (front.includes(kind)) return kind;
  }
  return 'Other';
}

/** Sort rank for a kind, in `KIND_ORDER`; `Other` sorts last. */
export function kindRank(kind: CardKind): number {
  const i = (KIND_ORDER as readonly string[]).indexOf(kind);
  return i === -1 ? KIND_ORDER.length : i;
}

export interface KindGroup<T> {
  key: CardKind;
  /** Plural header label, e.g. `Creatures`. */
  label: string;
  items: T[];
}

/**
 * Group items by primary card type, in `KIND_ORDER` (lands last). Items keep
 * their relative order within a group; empty groups are omitted.
 *
 *   groupByKind(deck, (entry) => entry.card.type_line)
 */
export function groupByKind<T>(
  items: readonly T[],
  typeLineOf: (item: T) => string | null | undefined,
): KindGroup<T>[] {
  const byKind = new Map<CardKind, T[]>();
  for (const item of items) {
    const kind = primaryKind(typeLineOf(item));
    const bucket = byKind.get(kind);
    if (bucket) bucket.push(item);
    else byKind.set(kind, [item]);
  }
  return [...byKind.entries()]
    .sort(([a], [b]) => kindRank(a) - kindRank(b))
    .map(([key, grouped]) => ({ key, label: KIND_PLURAL[key], items: grouped }));
}
