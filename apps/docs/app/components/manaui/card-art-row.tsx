'use client';

/**
 * A card list row with one markup and two densities, switched by the width
 * of the nearest `cards` container (so a phone and a narrow desktop pane
 * both get the right one):
 *
 *   - wide: a compact text row. Name left, mana cost right, hover preview
 *     on the name. Built for scanning a hundred cards with a mouse.
 *   - narrow (phone): a thick tile. Larger name with the mana cost under it,
 *     the card's illustration faded in from the right, and the whole tile is
 *     one tap target (`onSelect`). Built for reading at arm's length and for
 *     showing the list to someone else.
 *
 *   <CardArtRows>
 *     <CardArtRow card={card} quantity={2} onSelect={peek.open} />
 *   </CardArtRows>
 */
import * as React from 'react';
import { type Card, cardArt, cardManaCost } from '@manaui/core';

import { ProducedManaPips, RarityDot } from '@/components/manaui/card-badges';
import { CardHover } from '@/components/manaui/card-hover';
import { ManaCost } from '@/components/manaui/mana-cost';
import { cn } from '@/lib/utils';

/** The list element. Owns the `cards` container its rows respond to. */
export function CardArtRows({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('@container/cards flex flex-col', className)}
      {...props}
    />
  );
}

export function CardArtRow({
  card,
  name,
  quantity = 1,
  badges,
  onSelect,
  className,
  ...props
}: {
  /** A Scryfall card object. Without one the row is name-only. */
  card: Card | null | undefined;
  /** Text to show; defaults to `card.name`. */
  name?: string;
  quantity?: number;
  /** Extra inline chips after the name. Interactive ones stay tappable
   *  above the tile's tap target. */
  badges?: React.ReactNode;
  /** Narrow layout: the whole tile is a button that calls this. */
  onSelect?: (card: Card) => void;
} & Omit<React.ComponentProps<'li'>, 'children' | 'onSelect'>) {
  const label = name ?? card?.name ?? '';
  const art = cardArt(card);
  const [artBroken, setArtBroken] = React.useState(false);

  return (
    <li
      className={cn(
        'relative flex text-sm transition-colors',
        // wide: compact text row
        '@lg/cards:-mx-1.5 @lg/cards:items-center @lg/cards:justify-between @lg/cards:gap-3 @lg/cards:rounded-md @lg/cards:border-b @lg/cards:border-border/50 @lg/cards:px-1.5 @lg/cards:py-1 @lg/cards:last:border-0 @lg/cards:hover:bg-muted/50',
        // narrow: thick tile
        '@max-lg/cards:mb-1.5 @max-lg/cards:min-h-15 @max-lg/cards:flex-col @max-lg/cards:justify-center @max-lg/cards:gap-1 @max-lg/cards:overflow-hidden @max-lg/cards:rounded-xl @max-lg/cards:border @max-lg/cards:bg-card @max-lg/cards:px-3.5 @max-lg/cards:py-2 @max-lg/cards:last:mb-0 @max-lg/cards:active:bg-muted',
        className,
      )}
      {...props}
    >
      {art && !artBroken ? (
        // Decorative, narrow-only. `hidden` + lazy means wide layouts never
        // fetch it; the mask fades the art out toward the name.
        <img
          src={art}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          onError={() => setArtBroken(true)}
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-3/5 [mask-image:linear-gradient(to_right,transparent,black_80%)] object-cover object-[50%_28%] opacity-55 @max-lg/cards:block"
          data-testid="card-art-row-art"
        />
      ) : null}
      {card && onSelect ? (
        <button
          type="button"
          aria-label={`Show ${label}`}
          onClick={() => onSelect(card)}
          className="absolute inset-0 z-1 hidden rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 @max-lg/cards:block"
          data-testid="card-art-row-select"
        />
      ) : null}
      <span className="relative flex min-w-0 items-center gap-1.5 @max-lg/cards:max-w-[78%]">
        <RarityDot rarity={card?.rarity} />
        <CardHover card={card}>
          <span className="min-w-0 truncate @max-lg/cards:text-base @max-lg/cards:leading-tight @max-lg/cards:font-medium">
            {label}
          </span>
        </CardHover>
        {quantity > 1 ? (
          <span className="shrink-0 text-xs text-muted-foreground @max-lg/cards:text-sm @max-lg/cards:font-medium">
            ×{quantity}
          </span>
        ) : null}
        {badges ? (
          <span className="relative z-2 flex shrink-0 items-center gap-1.5">{badges}</span>
        ) : null}
      </span>
      <span className="relative flex shrink-0 items-center gap-1.5 empty:hidden @max-lg/cards:flex-row-reverse @max-lg/cards:justify-end">
        <ProducedManaPips card={card} />
        <ManaCost cost={cardManaCost(card)} className="@max-lg/cards:text-[15px]" />
      </span>
    </li>
  );
}
