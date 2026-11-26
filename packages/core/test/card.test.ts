import { describe, expect, it } from 'vitest';

import {
  type Card,
  cardArt,
  cardImage,
  cardManaCost,
  cardOracleText,
  cardTypeLine,
} from '../src';

const single: Card = {
  name: 'Sol Ring',
  mana_cost: '{1}',
  type_line: 'Artifact',
  oracle_text: '{T}: Add {C}{C}.',
  image_uris: {
    normal: 'https://cards.scryfall.io/normal/front/a/b/sol.jpg?1',
    art_crop: 'https://cards.scryfall.io/art_crop/front/a/b/sol.jpg?1',
  },
};

const doubleFaced: Card = {
  name: 'Valki, God of Lies // Tibalt, Cosmic Impostor',
  card_faces: [
    {
      name: 'Valki, God of Lies',
      mana_cost: '{1}{B}',
      type_line: 'Legendary Creature — God',
      oracle_text: 'When Valki enters…',
      image_uris: { normal: 'https://cards.scryfall.io/normal/front/v/a/valki.jpg' },
    },
    {
      name: 'Tibalt, Cosmic Impostor',
      mana_cost: '{5}{B}{R}',
      type_line: 'Legendary Planeswalker — Tibalt',
      oracle_text: 'As Tibalt enters…',
      image_uris: { normal: 'https://cards.scryfall.io/normal/back/v/a/valki.jpg' },
    },
  ],
};

describe('card accessors', () => {
  it('read top-level fields on single-faced cards', () => {
    expect(cardImage(single)).toBe(single.image_uris!.normal);
    expect(cardArt(single)).toBe(single.image_uris!.art_crop);
    expect(cardManaCost(single)).toBe('{1}');
    expect(cardTypeLine(single)).toBe('Artifact');
    expect(cardOracleText(single)).toBe('{T}: Add {C}{C}.');
  });

  it('fall back to the faces of double-faced cards', () => {
    expect(cardImage(doubleFaced)).toBe('https://cards.scryfall.io/normal/front/v/a/valki.jpg');
    expect(cardManaCost(doubleFaced)).toBe('{1}{B} // {5}{B}{R}');
    expect(cardTypeLine(doubleFaced)).toBe(
      'Legendary Creature — God // Legendary Planeswalker — Tibalt',
    );
    expect(cardOracleText(doubleFaced)).toBe(
      'Valki, God of Lies\nWhen Valki enters…\n\nTibalt, Cosmic Impostor\nAs Tibalt enters…',
    );
  });

  it('derive the art crop when only another rendition is known', () => {
    expect(cardArt(doubleFaced)).toBe('https://cards.scryfall.io/art_crop/front/v/a/valki.jpg');
    expect(cardArt({ name: 'x', image_uris: { normal: 'https://example.com/x.jpg' } })).toBeNull();
  });

  it('tolerate missing cards and fields', () => {
    expect(cardImage(null)).toBeNull();
    expect(cardArt(undefined)).toBeNull();
    expect(cardManaCost({ name: 'Forest' })).toBeNull();
    expect(cardOracleText({ name: 'Forest' })).toBeNull();
    expect(cardTypeLine({ name: 'Forest' })).toBeNull();
  });
});
