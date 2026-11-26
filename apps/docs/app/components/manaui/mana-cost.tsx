/**
 * Mana symbols, rendered with the mana-font icon font (`ms ms-*` classes).
 *
 *   <ManaCost cost="{2}{W}{U}" />          a Scryfall mana cost string
 *   <ColorIdentity colors={['U', 'W']} />  WUBRG pips in canonical order
 *   <ManaSymbol symbol="g" />              one glyph
 *
 * Needs mana-font's stylesheet loaded once in your app:
 *   @import "mana-font/css/mana.min.css";
 */
import { COLOR_NAMES, parseManaCostFaces, sortColors } from '@manaui/core';

import { cn } from '@/lib/utils';

/** One mana glyph. `symbol` is a mana-font suffix: `w`, `2`, `br`, `wp`, `x`… */
export function ManaSymbol({
  symbol,
  className,
}: {
  symbol: string;
  className?: string;
}) {
  const suffix = symbol.toLowerCase().replace(/[{}/]/g, '');
  return <i className={cn(`ms ms-${suffix} ms-cost ms-fw`, className)} aria-hidden />;
}

export function ManaCost({
  cost,
  className,
}: {
  /** Scryfall mana cost, e.g. `"{2}{W}{U}"` or `"{2}{R} // {R}"`. Null/empty renders nothing. */
  cost: string | null | undefined;
  className?: string;
}) {
  if (!cost) return null;
  const faces = parseManaCostFaces(cost);
  if (faces.length === 0) return null;
  return (
    <span
      className={cn('inline-flex items-center gap-px text-[12px] leading-none', className)}
      aria-label={`Mana cost ${cost}`}
    >
      {faces.map((symbols, f) => (
        <span key={f} className="inline-flex items-center gap-px">
          {f > 0 ? (
            <span aria-hidden className="mx-0.5 text-[11px] text-muted-foreground">
              {'//'}
            </span>
          ) : null}
          {symbols.map((sym, i) => (
            <ManaSymbol key={`${sym}-${i}`} symbol={sym} />
          ))}
        </span>
      ))}
    </span>
  );
}

export function ColorIdentity({
  colors,
  className,
}: {
  /** Scryfall color-identity letters. `[]`/null/undefined → the colorless pip. */
  colors: readonly string[] | null | undefined;
  className?: string;
}) {
  const ordered = sortColors(colors);
  const symbols = ordered.length > 0 ? ordered : ['C'];
  const label = `Color identity: ${symbols.map((s) => COLOR_NAMES[s] ?? s).join(', ')}`;
  return (
    <span
      className={cn('inline-flex items-center gap-px text-[13px] leading-none', className)}
      role="img"
      aria-label={label}
      data-testid="color-identity"
    >
      {symbols.map((sym) => (
        <ManaSymbol key={sym} symbol={sym} />
      ))}
    </span>
  );
}
