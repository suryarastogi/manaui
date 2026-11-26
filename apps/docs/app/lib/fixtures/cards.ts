/**
 * A snapshot of real Scryfall card objects (trimmed to the fields manaui
 * reads) for the docs previews. Card data and images © Wizards of the Coast,
 * provided by Scryfall (https://scryfall.com).
 */
import type { Card } from '@manaui/core';

import data from './cards.json';

const cards = data as Record<string, Card>;

function get(key: string): Card {
  const card = cards[key];
  if (!card) throw new Error(`fixture card missing: ${key}`);
  return card;
}

export const atraxa = get('atraxa-praetors-voice');
export const solRing = get('sol-ring');
export const commandTower = get('command-tower');
export const kitchenFinks = get('kitchen-finks');
export const bonecrusherGiant = get('bonecrusher-giant');
export const valki = get('valki-god-of-lies');
export const rhysticStudy = get('rhystic-study');
export const swordsToPlowshares = get('swords-to-plowshares');
export const cultivate = get('cultivate');
export const arcaneSignet = get('arcane-signet');
export const counterspell = get('counterspell');
export const smotheringTithe = get('smothering-tithe');
export const breedingPool = get('breeding-pool');
export const teferi = get('teferi-hero-of-dominaria');
export const stormCrow = get('storm-crow');

/** A card with rules text and no image: previews stay on the text. */
export const playtestCard: Card = {
  name: 'Unprinted Playtest Card',
  mana_cost: '{1}{U}',
  type_line: 'Instant',
  oracle_text: 'Draw two cards, then discard a card.',
  rarity: 'special',
  color_identity: ['U'],
};

/** A small Commander-ish deck for the list demos. */
export const demoDeck: { card: Card; quantity?: number }[] = [
  { card: atraxa },
  { card: kitchenFinks },
  { card: bonecrusherGiant },
  { card: stormCrow },
  { card: valki },
  { card: teferi },
  { card: swordsToPlowshares },
  { card: counterspell },
  { card: cultivate },
  { card: solRing },
  { card: arcaneSignet },
  { card: rhysticStudy },
  { card: smotheringTithe },
  { card: commandTower },
  { card: breedingPool },
];
