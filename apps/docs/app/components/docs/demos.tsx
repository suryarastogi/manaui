/**
 * Live demos embedded in the docs pages. Each mirrors the usage snippet
 * shown next to it.
 */
import { cardTypeLine, groupByKind } from '@manaui/core';

import { CardArtRow, CardArtRows } from '@/components/manaui/card-art-row';
import {
  KeywordChips,
  ProducedManaPips,
  RarityDot,
  StapleChip,
} from '@/components/manaui/card-badges';
import { CardHover, CardName } from '@/components/manaui/card-hover';
import { CardList } from '@/components/manaui/card-list';
import { useCardPeek } from '@/components/manaui/card-peek';
import { ColorIdentity, ManaCost, ManaSymbol } from '@/components/manaui/mana-cost';
import {
  atraxa,
  bonecrusherGiant,
  breedingPool,
  commandTower,
  counterspell,
  demoDeck,
  kitchenFinks,
  playtestCard,
  rhysticStudy,
  solRing,
  stormCrow,
  teferi,
  valki,
} from '@/lib/fixtures/cards';

import { Preview, WidthPreview } from './preview';

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-28 flex-col items-center gap-2">
      <span className="flex min-h-6 items-center gap-1">{children}</span>
      <code className="text-[11px] text-muted-foreground">{label}</code>
    </div>
  );
}

export function ManaCostDemo() {
  return (
    <Preview className="gap-x-8 gap-y-6">
      <Labelled label="{2}{W}{U}">
        <ManaCost cost="{2}{W}{U}" className="text-lg" />
      </Labelled>
      <Labelled label="{1}{G/W}{G/W}">
        <ManaCost cost="{1}{G/W}{G/W}" className="text-lg" />
      </Labelled>
      <Labelled label="{X}{B/P}{R}">
        <ManaCost cost="{X}{B/P}{R}" className="text-lg" />
      </Labelled>
      <Labelled label="{2}{R} // {1}{R}">
        <ManaCost cost="{2}{R} // {1}{R}" className="text-lg" />
      </Labelled>
    </Preview>
  );
}

export function ColorIdentityDemo() {
  return (
    <Preview className="gap-x-8 gap-y-6">
      <Labelled label="['G','W','U','B']">
        <ColorIdentity colors={['G', 'W', 'U', 'B']} className="text-lg" />
      </Labelled>
      <Labelled label="['R']">
        <ColorIdentity colors={['R']} className="text-lg" />
      </Labelled>
      <Labelled label="[]">
        <ColorIdentity colors={[]} className="text-lg" />
      </Labelled>
      <Labelled label='<ManaSymbol symbol="s" />'>
        <ManaSymbol symbol="s" className="text-lg" />
      </Labelled>
    </Preview>
  );
}

export function CardBadgesDemo() {
  return (
    <Preview className="gap-x-8 gap-y-6">
      <Labelled label="RarityDot">
        <RarityDot rarity="common" className="size-2.5" />
        <RarityDot rarity="uncommon" className="size-2.5" />
        <RarityDot rarity="rare" className="size-2.5" />
        <RarityDot rarity="mythic" className="size-2.5" />
      </Labelled>
      <Labelled label="StapleChip">
        <StapleChip edhrecRank={solRing.edhrec_rank} />
        <StapleChip edhrecRank={stormCrow.edhrec_rank} />
      </Labelled>
      <Labelled label="ProducedManaPips">
        <ProducedManaPips card={commandTower} className="text-sm" />
        <span className="mx-1 text-muted-foreground">·</span>
        <ProducedManaPips card={breedingPool} className="text-sm" />
      </Labelled>
      <Labelled label="KeywordChips">
        <KeywordChips keywords={atraxa.keywords} />
      </Labelled>
    </Preview>
  );
}

export function CardHoverDemo() {
  return (
    <Preview>
      <p className="max-w-md text-center text-base leading-loose">
        Ramp with <CardName card={solRing} showCost />, hold up{' '}
        <CardName card={counterspell} />, draw off <CardName card={rhysticStudy} /> and
        close with <CardName card={atraxa} />.
      </p>
    </Preview>
  );
}

export function CardHoverTriggerDemo() {
  return (
    <Preview>
      <CardHover card={teferi}>
        <span className="rounded-full border px-3 py-1.5 text-sm font-medium">
          Any element can be the trigger
        </span>
      </CardHover>
      <CardName card={playtestCard} />
    </Preview>
  );
}

export function CardPeekDemo() {
  const peek = useCardPeek();
  const cards = [solRing, bonecrusherGiant, valki, playtestCard];
  return (
    <Preview>
      {cards.map((card) => (
        <button
          key={card.name}
          type="button"
          onClick={() => peek.open(card)}
          className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          {card.name.split(' // ')[0]}
        </button>
      ))}
      {peek.dialog}
    </Preview>
  );
}

export function CardArtRowDemo() {
  const peek = useCardPeek();
  const cards = [atraxa, kitchenFinks, counterspell, solRing, commandTower];
  return (
    <WidthPreview>
      <CardArtRows>
        {cards.map((card, i) => (
          <CardArtRow
            key={card.name}
            card={card}
            quantity={i === 2 ? 2 : 1}
            onSelect={peek.open}
          />
        ))}
      </CardArtRows>
      {peek.dialog}
    </WidthPreview>
  );
}

const demoGroups = groupByKind(demoDeck, (entry) => cardTypeLine(entry.card)).map((group) => ({
  key: group.key,
  label: group.label,
  cards: group.items,
}));

export function CardListDemo({ initial = 'phone' }: { initial?: 'phone' | 'desktop' }) {
  return (
    <WidthPreview initial={initial}>
      <CardList groups={demoGroups} />
    </WidthPreview>
  );
}
