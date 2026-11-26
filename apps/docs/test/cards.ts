import type { Card } from '@manaui/core';

export const solRing: Card = {
  name: 'Sol Ring',
  mana_cost: '{1}',
  type_line: 'Artifact',
  oracle_text: '{T}: Add {C}{C}.',
  rarity: 'uncommon',
  color_identity: [],
  keywords: [],
  produced_mana: ['C'],
  edhrec_rank: 1,
  image_uris: {
    normal: 'https://cards.scryfall.io/normal/front/s/o/sol-ring.jpg?1',
    art_crop: 'https://cards.scryfall.io/art_crop/front/s/o/sol-ring.jpg?1',
  },
};

export const atraxa: Card = {
  name: "Atraxa, Praetors' Voice",
  mana_cost: '{G}{W}{U}{B}',
  type_line: 'Legendary Creature — Phyrexian Angel Horror',
  oracle_text: 'Flying, vigilance, deathtouch, lifelink\nAt the beginning of your end step, proliferate.',
  rarity: 'mythic',
  color_identity: ['B', 'G', 'U', 'W'],
  keywords: ['Flying', 'Vigilance', 'Deathtouch', 'Lifelink', 'Proliferate'],
  edhrec_rank: 1500,
  image_uris: {
    normal: 'https://cards.scryfall.io/normal/front/a/t/atraxa.jpg?1',
  },
};

/** A card with rules text but no image anywhere. */
export const textOnly: Card = {
  name: 'Playtest Card',
  mana_cost: '{2}{U}',
  type_line: 'Instant',
  oracle_text: 'Draw two cards.',
};
