/** Small classifications used by card badges. */

export const RARITY_ORDER: readonly string[] = [
  'common',
  'uncommon',
  'rare',
  'mythic',
  'special',
  'bonus',
];

/** Sort rank for a rarity; unknown rarities sort last. */
export function rarityRank(rarity: string | null | undefined): number {
  const i = RARITY_ORDER.indexOf((rarity ?? '').toLowerCase());
  return i === -1 ? RARITY_ORDER.length : i;
}

export type StapleTier = 'staple' | 'deep-cut';

/**
 * EDHREC-rank tiering: the community's most-played 1000 cards are
 * "staples"; beyond 20000 is genuinely off the beaten path.
 */
export function stapleTier(edhrecRank: number | null | undefined): StapleTier | null {
  if (edhrecRank == null) return null;
  if (edhrecRank <= 1000) return 'staple';
  if (edhrecRank > 20000) return 'deep-cut';
  return null;
}
