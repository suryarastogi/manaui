'use client';

/**
 * Card peek: the popup a tap on a card opens.
 *
 * It opens on the card's TEXT immediately (name, cost, type, rules), sized
 * like the card, while the image downloads behind it. A ring in the corner
 * tells the reader what is coming: it spins while the image loads, then
 * fills over PEEK_COUNTDOWN_MS, and when it completes the image fades in
 * over the text. The swap is never a surprise, and never a blank wait.
 *
 * Touching the text during the countdown holds it (you were reading); the
 * ring then waits as a "show card" button. Tapping the ring at any ready
 * point shows the image now. From the image, "Text" goes back; tapping the
 * image closes.
 *
 *   const peek = useCardPeek();
 *   <button onClick={() => peek.open(card)}>…</button>
 *   {peek.dialog}
 */
import * as React from 'react';
import { TypeIcon } from 'lucide-react';
import {
  type Card,
  PEEK_COUNTDOWN_MS,
  type PeekPhase,
  cardImage,
  cardManaCost,
  cardOracleText,
  cardTypeLine,
  peekPhase,
} from '@manaui/core';

import { KeywordChips, RarityDot, StapleChip } from '@/components/manaui/card-badges';
import { ManaCost } from '@/components/manaui/mana-cost';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type RingPhase = Exclude<PeekPhase, 'text' | 'image'>;

/** r=9 in a 24 box. */
const RING_CIRCUMFERENCE = 2 * Math.PI * 9;

const RING_LABEL: Record<RingPhase, string> = {
  loading: 'Loading card image',
  countdown: 'Card image in a moment',
  held: 'Show card image',
};

function PeekRing({ phase, onShow }: { phase: RingPhase; onShow: () => void }) {
  const ready = phase !== 'loading';
  const fillRef = React.useRef<SVGCircleElement>(null);

  // Fill the ring over the countdown. Driven from script so the component
  // needs no keyframes in your global CSS; purely a picture of the timer in
  // <CardPeek>, which is what actually reveals the image.
  React.useEffect(() => {
    if (phase !== 'countdown') return;
    const animation = fillRef.current?.animate?.(
      [{ strokeDashoffset: RING_CIRCUMFERENCE }, { strokeDashoffset: 0 }],
      { duration: PEEK_COUNTDOWN_MS, easing: 'linear', fill: 'forwards' },
    );
    return () => animation?.cancel();
  }, [phase]);

  return (
    <button
      type="button"
      // Not actionable until there is an image to show.
      disabled={!ready}
      onClick={(e) => {
        e.stopPropagation();
        onShow();
      }}
      className="flex items-center gap-2 rounded-full py-1 pr-1 pl-2.5 text-xs text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 enabled:hover:text-foreground"
      data-testid="card-peek-ring"
      data-phase={phase}
    >
      <span role="status">{RING_LABEL[phase]}</span>
      <svg viewBox="0 0 24 24" aria-hidden className="size-9 -rotate-90">
        <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2.5" className="stroke-muted" />
        <circle
          // Remount per phase so the fill always starts from empty.
          key={phase}
          ref={fillRef}
          cx="12"
          cy="12"
          r="9"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={
            phase === 'loading'
              ? RING_CIRCUMFERENCE * 0.72
              : phase === 'countdown'
                ? RING_CIRCUMFERENCE
                : 0
          }
          className={cn('origin-center stroke-foreground', phase === 'loading' && 'animate-spin')}
        />
      </svg>
    </button>
  );
}

/**
 * The peek itself, without the dialog: a card-shaped panel. Use it directly
 * to embed a peek in your own popover, drawer or page.
 */
export function CardPeek({
  card,
  onClose,
  className,
}: {
  card: Card;
  /** Called when the reader taps the revealed image. */
  onClose?: () => void;
  className?: string;
}) {
  const uri = cardImage(card, 'normal');
  const typeLine = cardTypeLine(card);
  const oracleText = cardOracleText(card);
  const hasDetail = !!typeLine || !!oracleText;

  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [held, setHeld] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);

  const phase = peekPhase({ hasImage: !!uri, failed, loaded, held, revealed });

  // The ring's CSS fill is the picture of this timer; the timer is the truth
  // (reduced-motion collapses the animation, not the wait).
  React.useEffect(() => {
    if (phase !== 'countdown') return;
    const timer = window.setTimeout(() => setRevealed(true), PEEK_COUNTDOWN_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const showImage = phase === 'image';

  return (
    <div
      className={cn(
        'relative aspect-[488/680] w-[min(92vw,calc(85svh*488/680),24rem)]',
        className,
      )}
      data-testid="card-peek"
      data-phase={phase}
    >
      {/* Text face: always rendered, so the image fades in OVER it. */}
      <div
        className="absolute inset-0 flex flex-col gap-3 rounded-[4.75%/3.5%] border bg-popover p-4 text-left text-popover-foreground shadow-lg"
        // A touch on the text during the countdown means "I'm reading".
        onPointerDown={() => {
          if (phase === 'countdown') setHeld(true);
        }}
        aria-hidden={showImage}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="flex min-w-0 items-center gap-2 text-lg leading-tight font-semibold">
            <RarityDot rarity={card.rarity} />
            <span className="min-w-0">{card.name}</span>
          </p>
          <ManaCost cost={cardManaCost(card)} className="mt-1 shrink-0 text-[17px]" />
        </div>
        {typeLine ? <p className="border-y py-1.5 text-sm font-medium">{typeLine}</p> : null}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {oracleText ? (
            <p className="text-base leading-relaxed whitespace-pre-wrap">{oracleText}</p>
          ) : !hasDetail ? (
            <p className="text-sm text-muted-foreground">No card details yet.</p>
          ) : null}
        </div>
        <div className="flex min-h-9 items-center justify-between gap-2">
          <span className="flex min-w-0 flex-wrap items-center gap-1">
            <KeywordChips keywords={card.keywords} />
            <StapleChip edhrecRank={card.edhrec_rank} />
          </span>
          {phase === 'loading' || phase === 'countdown' || phase === 'held' ? (
            <PeekRing phase={phase} onShow={() => setRevealed(true)} />
          ) : failed ? (
            <span className="text-xs text-muted-foreground">Card image unavailable</span>
          ) : null}
        </div>
      </div>

      {uri && !failed ? (
        // Mounted from the start: this IS the background download. It stays
        // transparent (and untouchable) until the ring completes.
        <img
          src={uri}
          alt={showImage ? card.name : ''}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          onClick={onClose}
          className={cn(
            'absolute inset-0 size-full rounded-[4.75%/3.5%] object-cover transition-opacity duration-700 ease-out',
            showImage ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          data-testid="card-peek-image"
        />
      ) : null}

      {showImage ? (
        <button
          type="button"
          onClick={() => {
            setHeld(true);
            setRevealed(false);
          }}
          className="absolute right-2 bottom-2 flex h-9 items-center gap-1.5 rounded-full bg-black/70 px-3 text-xs font-medium text-white outline-none duration-300 animate-in fade-in focus-visible:ring-3 focus-visible:ring-white/60"
          data-testid="card-peek-text"
        >
          <TypeIcon aria-hidden className="size-3.5" /> Text
        </button>
      ) : null}
    </div>
  );
}

/** A peek in a lightbox dialog. `card === null` means closed. */
export function CardPeekDialog({
  card,
  onClose,
}: {
  card: Card | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={card !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        data-manaui-lightbox=""
        className="w-auto max-w-none rounded-none border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">{card?.name ?? 'Card'}</DialogTitle>
        {/* Keyed by card: every open starts again from the text. */}
        {card ? <CardPeek key={card.name} card={card} onClose={onClose} /> : null}
      </DialogContent>
    </Dialog>
  );
}

/** One shared peek dialog for a whole list: call `open(card)`, render `dialog` once. */
export function useCardPeek(): {
  open: (card: Card) => void;
  close: () => void;
  dialog: React.ReactNode;
} {
  const [card, setCard] = React.useState<Card | null>(null);
  const close = React.useCallback(() => setCard(null), []);
  return {
    open: setCard,
    close,
    dialog: <CardPeekDialog card={card} onClose={close} />,
  };
}
