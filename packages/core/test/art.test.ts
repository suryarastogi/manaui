import { describe, expect, it } from 'vitest';

import { artCropUri, scryfallImageUri } from '../src';

describe('artCropUri', () => {
  it('maps a normal render to its art crop, keeping the cache-buster', () => {
    expect(
      artCropUri('https://cards.scryfall.io/normal/front/a/b/abc-123.jpg?1700000000'),
    ).toBe('https://cards.scryfall.io/art_crop/front/a/b/abc-123.jpg?1700000000');
  });

  it('maps png renders to the jpg art crop', () => {
    expect(artCropUri('https://cards.scryfall.io/png/back/a/b/abc.png')).toBe(
      'https://cards.scryfall.io/art_crop/back/a/b/abc.jpg',
    );
  });

  it('returns null for missing or non-Scryfall images', () => {
    expect(artCropUri(null)).toBeNull();
    expect(artCropUri(undefined)).toBeNull();
    expect(artCropUri('https://example.com/normal/front/a/b/abc.jpg')).toBeNull();
  });
});

describe('scryfallImageUri', () => {
  it('rewrites between renditions, using .png only for the png rendition', () => {
    const art = 'https://cards.scryfall.io/art_crop/front/a/b/abc.jpg?1';
    expect(scryfallImageUri(art, 'large')).toBe(
      'https://cards.scryfall.io/large/front/a/b/abc.jpg?1',
    );
    expect(scryfallImageUri(art, 'png')).toBe(
      'https://cards.scryfall.io/png/front/a/b/abc.png?1',
    );
  });
});
