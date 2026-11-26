/**
 * Card micro-badges: tiny signals for card rows and preview summaries,
 * drawn entirely from fields a Scryfall card already carries.
 *
 *   <RarityDot />         coloured gem dot (common → mythic)
 *   <StapleChip />        "Staple" (EDHREC rank ≤ 1000) / "Deep cut" (> 20000)
 *   <ProducedManaPips />  what a land or mana rock taps for, in WUBRG+C order
 *   <KeywordChips />      keyword chips, capped with a "+N" overflow
 */
import { type Card, cardTypeLine, primaryKind, stapleTier } from '@manaui/core';

import { ManaSymbol } from '@/components/manaui/mana-cost';
import { cn } from '@/lib/utils';

const RARITY_STYLE: Record<string, string> = {
  common: 'bg-neutral-400 dark:bg-neutral-500',
  uncommon: 'bg-slate-300 dark:bg-slate-400',
  rare: 'bg-amber-400',
  mythic: 'bg-gradient-to-br from-orange-500 to-rose-500',
  special: 'bg-fuchsia-400',
  bonus: 'bg-sky-400',
};

export function RarityDot({
  rarity,
  className,
}: {
  rarity: string | null | undefined;
  className?: string;
}) {
  const key = (rarity ?? '').toLowerCase();
  const style = RARITY_STYLE[key];
  if (!style) return null;
  const label = key.charAt(0).toUpperCase() + key.slice(1);
  return (
    <span
      role="img"
      aria-label={`Rarity: ${label}`}
      title={label}
      className={cn('inline-block size-1.5 shrink-0 rounded-full', style, className)}
    />
  );
}

export function StapleChip({
  edhrecRank,
  className,
}: {
  edhrecRank: number | null | undefined;
  className?: string;
}) {
  const tier = stapleTier(edhrecRank);
  if (!tier) return null;
  return tier === 'staple' ? (
    <span
      title="Top 1000 most-played on EDHREC"
      className={cn(
        'shrink-0 rounded bg-emerald-500/15 px-1 py-px text-[10px] font-medium text-emerald-600 dark:text-emerald-300',
        className,
      )}
    >
      Staple
    </span>
  ) : (
    <span
      title="Rarely played: a genuine deep cut"
      className={cn(
        'shrink-0 rounded bg-muted px-1 py-px text-[10px] font-medium text-muted-foreground',
        className,
      )}
    >
      Deep cut
    </span>
  );
}

const PIP_ORDER = ['W', 'U', 'B', 'R', 'G', 'C'] as const;

/**
 * What a mana source taps for. Shown only for lands and artifacts unless
 * `always` is set, so creature rows don't grow noise.
 */
export function ProducedManaPips({
  card,
  always = false,
  className,
}: {
  card: Card | null | undefined;
  always?: boolean;
  className?: string;
}) {
  const produced = card?.produced_mana ?? [];
  if (produced.length === 0) return null;
  if (!always) {
    const kind = primaryKind(cardTypeLine(card));
    if (kind !== 'Land' && kind !== 'Artifact') return null;
  }
  const upper = produced.map((p) => p.toUpperCase());
  const pips = PIP_ORDER.filter((p) => upper.includes(p));
  if (pips.length === 0) return null;
  const label = `Produces ${pips.join(', ')}`;
  return (
    <span
      className={cn('inline-flex items-center gap-px text-[10px] leading-none opacity-80', className)}
      role="img"
      aria-label={label}
      title={label}
    >
      {pips.map((p) => (
        <ManaSymbol key={p} symbol={p} />
      ))}
    </span>
  );
}

export function KeywordChips({
  keywords,
  limit = 4,
}: {
  keywords: readonly string[] | null | undefined;
  /** Chips shown before collapsing the rest into "+N". */
  limit?: number;
}) {
  if (!keywords || keywords.length === 0) return null;
  const shown = keywords.slice(0, limit);
  const extra = keywords.length - shown.length;
  return (
    <>
      {shown.map((keyword) => (
        <span
          key={keyword}
          className="rounded bg-muted px-1 py-px text-[10px] text-muted-foreground"
        >
          {keyword}
        </span>
      ))}
      {extra > 0 ? <span className="text-[10px] text-muted-foreground">+{extra}</span> : null}
    </>
  );
}
