'use client';

/**
 * Card preview on hover or tap.
 *
 * Desktop gets a hover preview. On any pointer, tapping the trigger pins the
 * panel open: it first shows the card summary (mana cost, type line, rules
 * text) and swaps to the card image once the image has loaded AND the
 * summary has been readable for a beat (IMAGE_DWELL_MS). Images already seen
 * this session skip both and render immediately. Tapping outside, scrolling
 * or Escape dismisses the panel; tapping the image opens it full size.
 *
 *   <CardHover card={card}>Sol Ring</CardHover>
 *   <CardName card={card} />     the same, with the dotted "autocard" underline
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  type Card,
  IMAGE_DWELL_MS,
  type PanelAnchor,
  cardImage,
  cardManaCost,
  cardOracleText,
  cardTypeLine,
  panelAnchor,
  shouldShowImage,
  stapleTier,
} from '@manaui/core';

import { KeywordChips, RarityDot, StapleChip } from '@/components/manaui/card-badges';
import { ManaCost } from '@/components/manaui/mana-cost';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/** Image URLs that finished loading this session: re-opens snap to the image. */
const loadedCardImages = new Set<string>();

/**
 * Full-screen card image: sized to the screen over a dark scrim; tapping the
 * image closes. The scrim colour comes from the `[data-manaui-lightbox]` rule
 * this component's registry item adds to your global CSS.
 */
export function CardZoomDialog({
  uri,
  alt,
  open,
  onOpenChange,
}: {
  uri: string;
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        data-manaui-lightbox=""
        className="w-auto max-w-none rounded-none border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <img
          src={uri}
          alt={alt}
          className="max-h-[85svh] w-auto max-w-[94vw] rounded-[4.75%/3.5%]"
          onClick={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function CardSummary({ card }: { card: Card }) {
  const typeLine = cardTypeLine(card);
  const oracleText = cardOracleText(card);
  const cost = cardManaCost(card);
  return (
    <span className="block w-64 rounded-lg border bg-popover p-2.5 text-xs text-popover-foreground shadow-lg">
      <span className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 font-medium">
          <RarityDot rarity={card.rarity} />
          <span className="min-w-0">{typeLine}</span>
        </span>
        {cost ? <ManaCost cost={cost} className="shrink-0" /> : null}
      </span>
      {oracleText ? (
        <span className="mt-1 block whitespace-pre-wrap text-muted-foreground">{oracleText}</span>
      ) : null}
      {(card.keywords?.length ?? 0) > 0 || stapleTier(card.edhrec_rank) ? (
        <span className="mt-1.5 flex flex-wrap items-center gap-1">
          <KeywordChips keywords={card.keywords} />
          <StapleChip edhrecRank={card.edhrec_rank} />
        </span>
      ) : null}
    </span>
  );
}

export function CardHover({
  card,
  loading = false,
  className,
  children,
}: {
  /** A Scryfall card object (or any subset of one). */
  card: Card | null | undefined;
  /** The card is being fetched: keep the trigger live and show a pulsing
   *  placeholder panel until it arrives (for rows that resolve on first hover). */
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const imageUri = cardImage(card, 'normal');
  const hasText = !!cardTypeLine(card) || !!cardOracleText(card);

  const containerRef = React.useRef<HTMLSpanElement>(null);
  const panelRef = React.useRef<HTMLSpanElement>(null);
  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [dwellElapsed, setDwellElapsed] = React.useState(false);
  const [zoomed, setZoomed] = React.useState(false);
  // Captured when the panel opens: a mid-open onLoad feeds the cache but must
  // not skip THIS open's dwell (the summary stays readable).
  const [cachedAtOpen, setCachedAtOpen] = React.useState(false);
  // Fixed-position anchor for the portaled panel, computed once per open.
  const [anchor, setAnchor] = React.useState<PanelAnchor | null>(null);

  const close = React.useCallback(() => {
    setOpen(false);
    setPinned(false);
  }, []);

  // Placement is decided once per open (scrolling dismisses the panel, so it
  // can't go stale). The panel portals to <body>: overflow containers such as
  // table wrappers would clip an absolutely-positioned child.
  React.useEffect(() => {
    if (!open) {
      setAnchor(null);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAnchor(panelAnchor(rect, { width: window.innerWidth, height: window.innerHeight }));
  }, [open]);

  // Dwell timer runs from open; a cache hit at open skips it entirely.
  React.useEffect(() => {
    if (!open || !imageUri) return;
    if (loadedCardImages.has(imageUri)) {
      setCachedAtOpen(true);
      return;
    }
    setCachedAtOpen(false);
    setDwellElapsed(false);
    const timer = window.setTimeout(() => setDwellElapsed(true), IMAGE_DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [open, imageUri]);

  // Dismiss on outside pointerdown, any scroll, or Escape (only while open).
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!containerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        close();
      }
    };
    const onScroll = () => close();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('scroll', onScroll, { capture: true });
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  // Nothing to preview: render the children untouched.
  if (!imageUri && !hasText && !loading) return <>{children}</>;

  const showImage = shouldShowImage({
    hasImage: !!imageUri,
    cached: cachedAtOpen,
    loaded,
    dwellElapsed,
  });
  const alt = card?.name ?? 'Card';

  return (
    <span ref={containerRef} className={cn('relative inline-flex min-w-0 items-center', className)}>
      <button
        type="button"
        className="inline-flex min-w-0 items-center text-left"
        aria-expanded={open}
        data-testid="card-hover-trigger"
        onClick={() => {
          if (pinned) close();
          else {
            setOpen(true);
            setPinned(true);
          }
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') setOpen(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse' && !pinned) setOpen(false);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          if (!pinned) setOpen(false);
        }}
      >
        {children}
      </button>

      {open && anchor
        ? createPortal(
            <span
              ref={panelRef}
              className="fixed z-40"
              data-testid="card-hover-panel"
              style={{
                left: anchor.left,
                top: anchor.top ?? undefined,
                bottom: anchor.bottom ?? undefined,
              }}
            >
              {showImage && imageUri ? (
                <button
                  type="button"
                  aria-label={`Show ${alt} full size`}
                  onClick={() => {
                    setZoomed(true);
                    close();
                  }}
                >
                  <img
                    src={imageUri}
                    alt={alt}
                    className="w-56 rounded-xl shadow-lg duration-200 animate-in fade-in-0 zoom-in-95"
                    data-testid="card-hover-image"
                  />
                </button>
              ) : (
                <>
                  {hasText && card ? (
                    <CardSummary card={card} />
                  ) : loading ? (
                    <span className="block w-64 rounded-lg border bg-popover p-2.5 text-xs shadow-lg">
                      <span className="animate-pulse text-muted-foreground">
                        Peeking at the card…
                      </span>
                    </span>
                  ) : null}
                  {failed ? (
                    <span className="mt-1 block w-64 rounded-md border border-dashed bg-popover px-2 py-1 text-[10px] text-muted-foreground">
                      Card image unavailable
                    </span>
                  ) : null}
                  {imageUri && !failed ? (
                    // Hidden preloader: display:none still fetches; onLoad
                    // flips the swap and feeds the session cache.
                    <img
                      src={imageUri}
                      alt=""
                      className="hidden"
                      onLoad={() => {
                        loadedCardImages.add(imageUri);
                        setLoaded(true);
                      }}
                      onError={() => setFailed(true)}
                    />
                  ) : null}
                </>
              )}
            </span>,
            document.body,
          )
        : null}

      {imageUri ? (
        <CardZoomDialog uri={imageUri} alt={alt} open={zoomed} onOpenChange={setZoomed} />
      ) : null}
    </span>
  );
}

/**
 * A card name with the dotted "autocard" underline and a hover preview.
 * Without a card (still loading, or the name didn't resolve) it degrades to
 * plain text, so nothing promises a preview that won't come.
 */
export function CardName({
  card,
  name,
  loading = false,
  showCost = false,
  className,
}: {
  card: Card | null | undefined;
  /** Text to show; defaults to `card.name`. */
  name?: string;
  loading?: boolean;
  /** Render the mana cost after the name. */
  showCost?: boolean;
  className?: string;
}) {
  const label = name ?? card?.name ?? '';
  if (!card && !loading) return <span className={className}>{label}</span>;
  const cost = showCost ? cardManaCost(card) : null;
  return (
    <span className="min-w-0">
      <CardHover card={card} loading={loading}>
        <span
          className={cn(
            'underline decoration-muted-foreground/50 decoration-dotted underline-offset-3',
            className,
          )}
        >
          {label}
        </span>
      </CardHover>
      {cost ? <ManaCost cost={cost} className="ml-1.5 duration-300 animate-in fade-in-0" /> : null}
    </span>
  );
}
