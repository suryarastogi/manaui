'use client';

/**
 * A grouped card list: collapsible sections of card rows that peek on tap.
 *
 * Section headers collapse their group at both densities; on a narrow
 * container they are thicker and stick to the top, so the current section
 * stays named while a long group scrolls.
 *
 *   <CardList groups={[{ key: 'creatures', label: 'Creatures', cards: [{ card, quantity: 1 }] }]} />
 *
 * Or compose the pieces yourself: <CardGroups>, <CardGroupSection>,
 * useCollapsedGroups(), with <CardArtRow> rows inside.
 */
import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import type { Card } from '@manaui/core';

import { CardArtRow } from '@/components/manaui/card-art-row';
import { useCardPeek } from '@/components/manaui/card-peek';
import { cn } from '@/lib/utils';

/** Which groups are collapsed. `forceOpen` (an active filter, say) shows
 *  every group without forgetting what was collapsed. */
export function useCollapsedGroups(forceOpen = false): {
  isOpen: (key: string) => boolean;
  toggle: (key: string) => void;
} {
  const [collapsed, setCollapsed] = React.useState<ReadonlySet<string>>(() => new Set());
  const toggle = React.useCallback((key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  }, []);
  const isOpen = React.useCallback(
    (key: string) => forceOpen || !collapsed.has(key),
    [forceOpen, collapsed],
  );
  return { isOpen, toggle };
}

/** The list wrapper. Owns the `cards` container the rows respond to. */
export function CardGroups({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('@container/cards flex flex-col gap-5', className)} {...props} />;
}

export function CardGroupSection({
  label,
  count,
  open,
  onToggle,
  headingTestId,
  className,
  children,
  ...props
}: {
  label: string;
  count: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  headingTestId?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<'section'>, 'children'>) {
  return (
    <section
      aria-label={label}
      // Tiles carry their own weight: pull narrow sections closer together.
      className={cn('@max-lg/cards:-mb-2', className)}
      {...props}
    >
      <h3
        className="top-0 z-10 mb-1 @max-lg/cards:sticky @max-lg/cards:mb-1.5 @max-lg/cards:bg-background/90 @max-lg/cards:backdrop-blur"
        data-testid={headingTestId}
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="flex w-full items-center gap-1.5 rounded-md text-left text-xs font-medium tracking-wide text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 @max-lg/cards:h-11 @max-lg/cards:text-sm @max-lg/cards:font-semibold @max-lg/cards:text-foreground"
        >
          <span className="min-w-0 flex-1 truncate">
            {label} <span className="text-muted-foreground">· {count}</span>
          </span>
          <ChevronDownIcon
            aria-hidden
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 @max-lg/cards:size-5',
              !open && '-rotate-90',
            )}
          />
        </button>
      </h3>
      {open ? <ul className="flex flex-col">{children}</ul> : null}
    </section>
  );
}

export interface CardListEntry {
  card: Card;
  quantity?: number;
  /** Extra inline chips after the name. */
  badges?: React.ReactNode;
}

export interface CardListGroup {
  key: string;
  label: string;
  cards: CardListEntry[];
}

/** Sections + rows + one shared peek dialog, wired together. */
export function CardList({
  groups,
  forceOpen = false,
  className,
}: {
  groups: CardListGroup[];
  /** Show every group regardless of what the reader collapsed. */
  forceOpen?: boolean;
  className?: string;
}) {
  const { isOpen, toggle } = useCollapsedGroups(forceOpen);
  const peek = useCardPeek();

  return (
    <CardGroups className={className}>
      {groups.map((group) => (
        <CardGroupSection
          key={group.key}
          label={group.label}
          count={group.cards.reduce((n, entry) => n + (entry.quantity ?? 1), 0)}
          open={isOpen(group.key)}
          onToggle={() => toggle(group.key)}
        >
          {group.cards.map((entry) => (
            <CardArtRow
              key={entry.card.name}
              card={entry.card}
              quantity={entry.quantity}
              badges={entry.badges}
              onSelect={peek.open}
            />
          ))}
        </CardGroupSection>
      ))}
      {peek.dialog}
    </CardGroups>
  );
}
